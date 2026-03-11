import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../lib/authStore";

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);

  if (status === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
