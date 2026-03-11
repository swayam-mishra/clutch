import { useCallback, useEffect, useRef, useState } from "react";
import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { toast } from "sonner";
import { apiFetch } from "../lib/api";
import { getMessagingInstance } from "../lib/firebase";

// ─── Constants ────────────────────────────────────────────────────────────────

const PREF_KEY = "clutch:push_enabled";
const TOKEN_KEY = "clutch:fcm_token";
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationStatus =
  | "idle"          // never enabled by user
  | "requesting"    // waiting for browser permission prompt
  | "registering"   // getting FCM token + POSTing to backend
  | "active"        // registered and running
  | "denied"        // browser permission denied
  | "unsupported"   // browser doesn't support notifications
  | "error";        // unexpected failure

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadPref(): boolean {
  try { return localStorage.getItem(PREF_KEY) === "true"; } catch { return false; }
}
function savePref(v: boolean) {
  try { localStorage.setItem(PREF_KEY, String(v)); } catch {}
}
function loadStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function saveStoredToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

// ─── Build service worker URL with Firebase config injected as query params ──

function buildSwUrl(): string {
  const env = import.meta.env;
  const params = new URLSearchParams({
    apiKey: env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: env.VITE_FIREBASE_APP_ID ?? "",
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

// ─── Core registration logic ──────────────────────────────────────────────────

async function registerFcmToken(): Promise<string> {
  // Register (or reuse) the service worker
  const swReg = await navigator.serviceWorker.register(buildSwUrl(), {
    scope: "/",
  });

  const messaging = await getMessagingInstance();
  if (!messaging) throw new Error("FCM not supported in this browser.");

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  if (!token) throw new Error("FCM returned an empty token.");

  return token;
}

async function postTokenToBackend(token: string): Promise<void> {
  await apiFetch("/api/notifications/register", {
    method: "POST",
    body: JSON.stringify({ deviceToken: token }),
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [enabled, setEnabled] = useState<boolean>(loadPref);
  const [status, setStatus] = useState<NotificationStatus>(() => {
    if (!("Notification" in window)) return "unsupported";
    if (loadPref()) {
      // If previously enabled, we'll verify on mount — start as idle until checked
      return "idle";
    }
    return "idle";
  });

  // Prevent double-registration on Vite HMR or React StrictMode double-mount
  const registeredRef = useRef(false);
  // Unsubscribe handle for onMessage
  const unsubMessageRef = useRef<(() => void) | null>(null);

  // ── Attach foreground message listener ──────────────────────────────────────
  const attachForegroundListener = useCallback(async () => {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    // Detach any existing listener first
    unsubMessageRef.current?.();

    unsubMessageRef.current = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "Clutch";
      const body = payload.notification?.body ?? "";
      toast(title, { description: body });
    });
  }, []);

  // ── Core: get token, detect refresh, register ─────────────────────────────
  const syncToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = await registerFcmToken();
      const storedToken = loadStoredToken();

      // Always re-register when the token has rotated
      if (token !== storedToken) {
        await postTokenToBackend(token);
        saveStoredToken(token);
      }

      await attachForegroundListener();
      return true;
    } catch (err) {
      console.error("[useNotifications] syncToken failed:", err);
      return false;
    }
  }, [attachForegroundListener]);

  // ── On mount: if user had previously enabled, silently re-sync token ────────
  useEffect(() => {
    if (!enabled) return;
    if (registeredRef.current) return;
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    // If permission was revoked externally since last session, respect that
    if (Notification.permission === "denied") {
      setEnabled(false);
      savePref(false);
      saveStoredToken(null);
      setStatus("denied");
      return;
    }

    if (Notification.permission !== "granted") {
      // Permission was never granted — reset preference silently
      setEnabled(false);
      savePref(false);
      setStatus("idle");
      return;
    }

    registeredRef.current = true;
    setStatus("registering");

    syncToken().then((ok) => {
      setStatus(ok ? "active" : "error");
      if (!ok) {
        setEnabled(false);
        savePref(false);
      }
    });

    return () => {
      unsubMessageRef.current?.();
    };
  }, []); // intentionally runs once on mount

  // ── enable() — called only when user explicitly flips the toggle ON ─────────
  const enable = useCallback(async () => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
      toast.error("Your browser doesn't support push notifications.");
      return;
    }

    setStatus("requesting");

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "denied") {
      setStatus("denied");
      toast.error("Notification permission denied. Enable it in your browser settings.");
      return;
    }

    setStatus("registering");

    const ok = await syncToken();
    if (ok) {
      setEnabled(true);
      savePref(true);
      setStatus("active");
      toast.success("Push notifications enabled.");
    } else {
      setStatus("error");
      toast.error("Failed to register for push notifications. Try again.");
    }
  }, [syncToken]);

  // ── disable() — called when user flips toggle OFF ───────────────────────────
  const disable = useCallback(async () => {
    setEnabled(false);
    savePref(false);
    saveStoredToken(null);
    setStatus("idle");

    // Detach foreground listener
    unsubMessageRef.current?.();
    unsubMessageRef.current = null;
    registeredRef.current = false;

    // Delete the FCM token client-side (stops delivery to this device)
    try {
      const messaging = await getMessagingInstance();
      if (messaging) await deleteToken(messaging);
    } catch {
      // Non-fatal — token will expire naturally
    }

    // Inform the server to disable push for this user
    try {
      await apiFetch("/api/notifications/settings", {
        method: "PUT",
        body: JSON.stringify({ notificationsEnabled: false }),
      });
    } catch {
      // Non-fatal — server-side preference is best-effort
    }

    toast("Push notifications disabled.");
  }, []);

  return {
    enabled,
    status,
    enable,
    disable,
    /** True while the permission prompt is showing or the token is being registered */
    isLoading: status === "requesting" || status === "registering",
    /** The browser permission was explicitly blocked */
    permissionDenied: status === "denied",
    /** This browser/context doesn't support web push */
    unsupported: status === "unsupported",
  };
}
