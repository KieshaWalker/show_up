/**
 * User Profile Component
 *
 * Displays user information and authentication status in the dashboard.
 * Shows user avatar, name, and sign-out option for authenticated users.
 */

import { stackServerApp } from "@/stack/server";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import React from "react";

/**
 * User Profile Page Component
 *
 * Server component that displays user information in the main dashboard.
 * Conditionally renders sign-in button for guests or user profile for authenticated users.
 *
 * Features:
 * - Server-side user authentication check
 * - User avatar with first letter of display name
 * - Welcome message with user's display name
 * - Sign-out link for authenticated users
 * - Sign-in button for unauthenticated users
 *
 * @returns {JSX.Element} User profile section or sign-in button
 */
export default async function userPage() {
  // Fetch current user on server-side
  const user = await stackServerApp.getUser();

  // Render sign-in button for unauthenticated users
  if (!user) {
    return (
      <a href="/handler/sign-in" className="glass-button">
        Sign In
      </a>
    );
  }

  // Render user profile for authenticated users
  return (
    <main className="user-main">
      <div className="user-info">
        {/* User Avatar - First letter of display name */}
        <div className="user-avatar">
          {user.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          {/* Welcome message with user's name */}
          <h3>Welcome, {user.displayName}!</h3>
          {/* Sign out link */}
          <a href="/handler/sign-out" className="nav-link">
            Sign Out
          </a>
        </div>
      </div>
    </main>
  );
}