import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { fetchSession } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import { router } from "./routes.tsx";

export default function App() {
  const { status, setAuthenticated, setUnauthenticated } = useAuthStore();

  useEffect(() => {
    fetchSession()
      .then(setAuthenticated)
      .catch(() => setUnauthenticated());
  }, [setAuthenticated, setUnauthenticated]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A2E" }}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
