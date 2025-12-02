/**
 * Stack Auth Server Configuration
 *
 * Configures the server-side Stack Auth application instance.
 * This handles server-side authentication, API routes, and secure token validation.
 */

import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { stackClientApp } from "./client";

/**
 * Stack Server Application Instance
 *
 * Creates and exports the server-side Stack Auth application instance.
 * Inherits configuration from the client app to ensure consistency between
 * client and server authentication handling.
 *
 * The "server-only" import ensures this module is never bundled for the client,
 * maintaining security by keeping server-side authentication logic private.
 *
 * This instance is used in:
 * - Server components for user authentication checks
 * - API routes for secure endpoint protection
 * - Server-side data fetching with user context
 * - Authentication middleware and guards
 */
export const stackServerApp = new StackServerApp({
  inheritsFrom: stackClientApp,
});
