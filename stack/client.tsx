/**
 * Stack Auth Client Configuration
 *
 * Configures the client-side Stack Auth application instance.
 * This handles authentication state management and API communication on the client side.
 */

import { StackClientApp } from "@stackframe/stack";

/**
 * Stack Client Application Instance
 *
 * Creates and exports the main client-side Stack Auth application instance.
 * Configured to use Next.js cookies for token storage, which provides secure
 * client-side session management and automatic token refresh.
 *
 * Token Store Options:
 * - "nextjs-cookie": Stores tokens in HTTP-only cookies (recommended for Next.js)
 * - "memory": Stores tokens in memory (not persistent across page reloads)
 * - "localStorage": Stores tokens in browser localStorage
 *
 * This instance is used throughout the client-side application for:
 * - User authentication state
 * - API calls requiring authentication
 * - User profile management
 * - Sign in/out functionality
 */
export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
});
