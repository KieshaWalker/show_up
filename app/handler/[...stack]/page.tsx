/**
 * Stack Auth Handler Page
 *
 * Catch-all route handler for Stack Auth authentication flows.
 * Handles all authentication-related routes including sign-in, sign-up, password reset, etc.
 */

import { StackHandler } from "@stackframe/stack";

/**
 * Stack Handler Component
 *
 * Renders the Stack Auth handler for all authentication routes.
 * This component handles the full-page authentication UI and flow management.
 *
 * The [...stack] dynamic route catches all Stack Auth related URLs:
 * - /handler/sign-in
 * - /handler/sign-up
 * - /handler/password-reset
 * - /handler/email-verification
 * - And other auth-related routes
 *
 * The fullPage prop renders the complete authentication interface
 * instead of embedding it within the existing page layout.
 *
 * @returns {JSX.Element} Full-page authentication interface
 */
export default function Handler() {
  return <StackHandler fullPage />;
}
