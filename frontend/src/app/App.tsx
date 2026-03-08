import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1A1A2E" }}>
      <RouterProvider router={router} />
    </div>
  );
}
