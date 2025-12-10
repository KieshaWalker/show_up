import { redirect } from "next/navigation";
import { checkDbConnection } from "./db";
import userPage from "./handler/[...stack]/user";
import { stackServerApp } from "@/stack/server";
import NutritionPreview from "./components/NutritionPreview";
import CalendarPreview from "./components/CalendarPreview";
import featuring from "./featuring/page";

/**
 * Home Page Component
 *
 * Renders the main dashboard for authenticated users or a landing page for guests.
 * Performs database connection check and user authentication on server-side.
 *
 * Features:
 * - Database health check on page load
 * - Conditional rendering based on authentication status
 * - Landing page for unauthenticated users
 * - Dashboard with habit, nutrition, and calendar previews for authenticated users
 *
 * @returns {JSX.Element} Home page content
 */
export default async function Home() {
  // Check database connectivity on page load
  await checkDbConnection();

  // Check if user is authenticated
  const user = await stackServerApp.getUser();

  // Render landing page for unauthenticated users
  if (!user) {
    return (
      <div className="hero-section">
        <div className="hero-content fade-in-up">
          <p className="hero-subtitle">
            Build better habits. Transform your life.
          </p>
          <a href="/handler/sign-in" className="hero-cta">
            Start Building Habits
          </a>
        </div>
      </div>
    );
  }

  const userContent = await userPage();
  if (userContent instanceof Response) {
    redirect("/handler/sign-in");
  }

  const featuringContent = await featuring();
  if (featuringContent instanceof Response) {
    redirect("/handler/sign-in");
  }


  // Render dashboard for authenticated users
  return (
    <div className="main-content">
      <div className="content-container">
          <div className="dashboard-stack fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="bubbles">
                <h1 className="page-t">Momentum Matters</h1>
                </div>
          {featuringContent}
          <NutritionPreview />
          <CalendarPreview />
        </div>
      </div>
    </div>
  );
}
