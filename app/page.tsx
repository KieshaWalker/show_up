/**
 * Home Page Component
 *
 * The main dashboard page of the ShowUp habit tracking application.
 * Displays different content based on user authentication status.
 */

import Image from "next/image";
import Link from "next/link";
import { checkDbConnection } from "./db";
import Handler from "./handler/[...stack]/page";
import userPage from "./handler/[...stack]/user";
import { StackServerApp } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import HabitsPreview from "./components/HabitsPreview";
import NutritionPreview from "./components/NutritionPreview";
import CalendarPreview from "./components/CalendarPreview";

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
  const result = await checkDbConnection();

  // Check if user is authenticated
  const user = await stackServerApp.getUser();

  // Render landing page for unauthenticated users
  if (!user) {
    return (
      <div className="hero-section">
        <div className="hero-content fade-in-up">
          <h1 className="hero-title">ShowUp</h1>
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

  // Render dashboard for authenticated users
  return (
    <div className="main-content">
      <div className="content-container">
        {/* User profile section */}
        <div className="user-profile fade-in-up">
          {await userPage()}
        </div>

        {/* Main dashboard title */}
        <h1 className="page-title fade-in-up">Your Journey Starts Here</h1>

        {/* Dashboard preview components */}
        <div className="fade-in-up">
          <HabitsPreview />
          <NutritionPreview />
          <CalendarPreview />
        </div>
      </div>
    </div>
  );
}
