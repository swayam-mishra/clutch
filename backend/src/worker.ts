// backend/src/worker.ts
// Dedicated entry point for background cron jobs.
// Run independently so scheduled tasks never block the API process.
import dotenv from "dotenv";
import { initCronJobs } from "./jobs/nudge.cron";

dotenv.config();

console.log("[WORKER] Starting background cron worker...");
initCronJobs();
