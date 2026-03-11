import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { fetchSession } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import { router } from "./routes";

export default function App() {
  const { status, setAuthenticated, setUnauthenticated } = useAuthStore();

  useEffect(() => {
    fetchSession()
      .then(setAuthenticated)
      .catch(() => setUnauthenticated());
  }, [setAuthenticated, setUnauthenticated]);

  if (status === "loading") return null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A2E" }}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
