import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";

// Routes — exactly the 11 domains defined in be-integration.md
import authRoutes from "./routes/auth.routes";       // §2  Auth
import userRoutes from "./routes/user.routes";       // §3  User / Profile
import budgetRoutes from "./routes/budget.routes";   // §4  Budget
import expenseRoutes from "./routes/expense.routes"; // §5  Expenses
import analyticsRoutes from "./routes/analytics.routes"; // §6 Analytics
import goalsRoutes from "./routes/goals.routes";     // §7  Goals
import challengesRoutes from "./routes/challenges.routes"; // §8 Challenges
import advisorRoutes from "./routes/advisor.routes"; // §9  Purchase Advisor
import chatRoutes from "./routes/chat.routes";       // §10 Chat
import healthRoutes from "./routes/healthScore.routes"; // §11 Health Score

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
}));
app.use(express.json());
app.use(compression());

// Cache GET responses 5 min at browser level
app.use((req, res, next) => {
  if (req.method === "GET") res.set("Cache-Control", "private, max-age=300");
  next();
});

// Liveness probe (not part of the frontend API contract)
app.get("/api/ping", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes in wiring order from be-integration.md §14
app.use("/api/auth",       authRoutes);
app.use("/api/user",       userRoutes);
app.use("/api/budget",     budgetRoutes);
app.use("/api/expenses",   expenseRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/goals",      goalsRoutes);
app.use("/api/challenges", challengesRoutes);
app.use("/api/advisor",    advisorRoutes);
app.use("/api/chat",       chatRoutes);
app.use("/api/health",     healthRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Clutch backend running on http://0.0.0.0:${PORT}`);
});

export default app;
