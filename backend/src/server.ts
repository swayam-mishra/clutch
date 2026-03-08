import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import expenseRoutes from "./routes/expense.routes";
import budgetRoutes from "./routes/budget.routes";
import aiRoutes from "./routes/ai.routes";
import healthScoreRoutes from "./routes/healthScore.routes";
import authRoutes from "./routes/auth.routes";
import insightsRoutes from "./routes/insights.routes";
import goalsRoutes from "./routes/goals.routes";
import notificationsRoutes from "./routes/notifications.routes";
import challengesRoutes from "./routes/challenges.routes";
import splitsRoutes from "./routes/splits.routes";
import { initCronJobs } from "./jobs/nudge.cron";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/health-score", healthScoreRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/challenges", challengesRoutes);
app.use("/api/splits", splitsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Clutch backend running on http://localhost:${PORT}`);

  // Initialize scheduled tasks
  initCronJobs();
});

export default app;
