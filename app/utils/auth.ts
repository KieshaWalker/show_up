/**
 * Authentication Utilities
 *
 * Centralized authentication helper functions for the ShowUp app.
 * Uses Stack Auth for user management and session handling.
 */

import { stackServerApp } from "@/stack/server";
import { NextResponse } from "next/server";

/**
 * Authenticate and retrieve the current user
 *
 * Checks if a user is authenticated via Stack Auth and returns the user object.
 * If no user is found, returns an unauthorized response.
 *
 * This function is used across API routes to ensure only authenticated users
 * can access protected endpoints. It centralizes authentication logic and
 * provides consistent error handling.
 *
 * @returns {Promise<any | NextResponse>} User object if authenticated, or unauthorized response
 */
export async function authenticateUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}