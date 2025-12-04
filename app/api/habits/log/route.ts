/**
 * Habit Logs API Route Handler
 *
 * API endpoints for managing habit completion logs.
 * Supports logging habit completions and retrieving habit log history.
 * All endpoints require user authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../db";
import { authenticateUser } from "../../../utils/auth";

/**
 * POST - Log habit completion
 *
 * Records or updates a habit completion log entry for a specific date.
 * Uses upsert logic to handle both new entries and updates to existing ones.
 *
 * @param request - Next.js request object with habit log data (habitId, date, completed, notes)
 * @returns Promise<NextResponse> - Success response with logged habit data or error
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Parse request body
    const { habitId, date, completed } = await request.json();

    // Validate required fields
    if (!habitId || !date) {
      return NextResponse.json(
        { error: "habitId and date are required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Security check: Ensure habit belongs to authenticated user
    const habitCheck = await pool.query(
      "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
      [habitId, user.id]
    );

    if (habitCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Habit not found or access denied" },
        { status: 404 }
      );
    }

    // Check if habit log already exists for this habit, user, and date
    const existingLogQuery = `
      SELECT id FROM habit_logs 
      WHERE habit_id = $1 AND user_id = $2 AND date = $3
    `;
    const existingLog = await pool.query(existingLogQuery, [habitId, user.id, date]);

    let result;
    if (existingLog.rows.length > 0) {
      // Update existing log
      const updateQuery = `
        UPDATE habit_logs 
        SET completed = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      result = await pool.query(updateQuery, [completed || false, existingLog.rows[0].id]);
    } else {
      // Insert new log
      const insertQuery = `
        INSERT INTO habit_logs (habit_id, user_id, date, completed)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      result = await pool.query(insertQuery, [habitId, user.id, date, completed || false]);
    }

    return NextResponse.json({
      message: "Habit log saved successfully",
      habitLog: result.rows[0]
    });

  } catch (error) {
    console.error("Error logging habit:", error);
    return NextResponse.json(
      { error: "Failed to log habit" },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve habit logs
 *
 * Fetches habit log entries with optional filtering by habit ID and/or date.
 * Includes habit titles in the response.
 *
 * Query Parameters:
 * - habitId: Filter logs for a specific habit
 * - date: Filter logs for a specific date
 *
 * @param request - Next.js request object with optional query parameters
 * @returns Promise<NextResponse> - Success response with habit logs array or error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');
    const date = searchParams.get('date');

    const pool = getPool();

    // Build dynamic query with optional filters
    let query = `
      SELECT hl.*, h.title
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = $1
    `;
    const params = [user.id];

    // Add habit ID filter if provided
    if (habitId) {
      query += " AND hl.habit_id = $2";
      params.push(habitId);
    }

    // Add date filter if provided
    if (date) {
      query += ` AND hl.date = $${params.length + 1}`;
      params.push(date);
    }

    // Order by date (newest first) and habit title
    query += " ORDER BY hl.date DESC, h.title";

    const result = await pool.query(query, params);

    return NextResponse.json({ habitLogs: result.rows });

  } catch (error) {
    console.error("Error fetching habit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit logs" },
      { status: 500 }
    );
  }
}