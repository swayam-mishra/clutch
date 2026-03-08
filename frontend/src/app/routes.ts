import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { ExpensesPage } from "./components/dashboard/ExpensesPage";
import { BudgetPage } from "./components/dashboard/BudgetPage";
import { InsightsPage } from "./components/dashboard/InsightsPage";
import { GoalsPage } from "./components/dashboard/GoalsPage";
import { ChallengesPage } from "./components/dashboard/ChallengesPage";
import { SettingsPage } from "./components/dashboard/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/dashboard/expenses",
    Component: ExpensesPage,
  },
  {
    path: "/dashboard/budget",
    Component: BudgetPage,
  },
  {
    path: "/dashboard/insights",
    Component: InsightsPage,
  },
  {
    path: "/dashboard/goals",
    Component: GoalsPage,
  },
  {
    path: "/dashboard/challenges",
    Component: ChallengesPage,
  },
  {
    path: "/dashboard/settings",
    Component: SettingsPage,
  },
]);