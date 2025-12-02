/**
 * Database Configuration and Connection Management
 *
 * This module handles PostgreSQL database connections for the ShowUp habit tracking app.
 * It uses connection pooling for efficient database access and integrates with Vercel's
 * serverless functions for optimal performance in production.
 */

import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

/**
 * Global database connection pool instance
 * Initialized lazily to avoid connection issues during module loading
 */
let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 *
 * Uses singleton pattern to ensure only one pool instance exists across the application.
 * The pool is configured with the DATABASE_URL environment variable and attached to
 * Vercel's serverless function context for proper connection management.
 *
 * @returns {Pool} PostgreSQL connection pool instance
 */
export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    attachDatabasePool(pool);
  }
  return pool;
}

/**
 * Check database connection health and version
 *
 * Performs a simple query to verify database connectivity and logs the PostgreSQL version.
 * Used for health checks and debugging database connection issues.
 *
 * @returns {Promise<string>} Connection status message
 */
export async function checkDbConnection() {
  if (!process.env.DATABASE_URL) {
    return "No DATABASE_URL environment variable";
  }
  try {
    const pool = getPool();
    const result = await pool.query("SELECT version()");
    console.log("Pg version:", result);
    return "Database connected";
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return "Database not connected";
  }
}
