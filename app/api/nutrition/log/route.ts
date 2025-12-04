/**
 * Nutrition Logs API Route Handler
 *
 * API endpoints for managing nutrition consumption logs.
 * Supports logging food consumption, retrieving nutrition history, and deleting logs.
 * All endpoints require user authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../db";
import { authenticateUser } from "../../../utils/auth";

/**
 * POST - Log food consumption
 *
 * Records a food consumption entry for tracking nutritional intake.
 * Links to existing food items and includes quantity and optional notes.
 *
 * @param request - Next.js request object with nutrition log data (foodId, date, quantity, notes)
 * @returns Promise<NextResponse> - Success response with logged nutrition data or error
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
    const { foodId, date, quantity, mealType } = await request.json();

    // Validate required fields
    if (!foodId || !date) {
      return NextResponse.json(
        { error: "foodId and date are required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Security check: Ensure food item belongs to authenticated user or is a pantry item
    const foodCheck = await pool.query(
      "SELECT id, calories FROM food WHERE id = $1 AND (user_id = $2 OR user_id = 'all_users')",
      [foodId, user.id]
    );

    if (foodCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Food item not found or access denied" },
        { status: 404 }
      );
    }

    // Insert nutrition log entry
    const query = `
      INSERT INTO nutrition_logs (food_id, user_id, date, quantity, meal_type, calories)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const baseCalories = foodCheck.rows[0].calories || 0;
    const quantityValue = quantity || 1;
    const calculatedCalories = baseCalories * quantityValue;
    const mealTypeValue = mealType || 'unspecified';

    const result = await pool.query(query, [
      foodId,
      user.id,
      date,
      quantityValue,
      mealTypeValue,
      calculatedCalories,
    ]);

    // Fetch complete nutrition log with food details for response
    const foodDetailsQuery = `
      SELECT nl.*, f.name, f.calories, f.serving_size, f.protein, f.total_fat, f.total_carbohydrate
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.id = $1
    `;

    const detailsResult = await pool.query(foodDetailsQuery, [result.rows[0].id]);

    return NextResponse.json({
      message: "Nutrition logged successfully",
      nutritionLog: detailsResult.rows[0]
    });

  } catch (error) {
    console.error("Error logging nutrition:", error);
    return NextResponse.json(
      { error: "Failed to log nutrition" },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve nutrition logs
 *
 * Fetches nutrition log entries with optional filtering by food ID and/or date.
 * Includes food details (name, calories, macros) in the response for complete tracking.
 *
 * Query Parameters:
 * - foodId: Filter logs for a specific food item
 * - date: Filter logs for a specific date
 *
 * @param request - Next.js request object with optional query parameters
 * @returns Promise<NextResponse> - Success response with nutrition logs array or error
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
    const foodId = searchParams.get('foodId');
    const date = searchParams.get('date');

    const pool = getPool();

    // Build dynamic query with optional filters and food details
    let query = `
      SELECT nl.*, f.name, f.calories, f.serving_size, f.protein, f.total_fat, f.total_carbohydrate
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.user_id = $1
    `;
    const params = [user.id];

    // Add food ID filter if provided
    if (foodId) {
      query += " AND nl.food_id = $2";
      params.push(foodId);
    }

    // Add date filter if provided
    if (date) {
      query += ` AND nl.date = $${params.length + 1}`;
      params.push(date);
    }

    // Order by date (newest first) and food name
    query += " ORDER BY nl.date DESC, f.name";

    const result = await pool.query(query, params);

    return NextResponse.json({ nutritionLogs: result.rows });

  } catch (error) {
    console.error("Error fetching nutrition logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition logs" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a nutrition log entry
 *
 * Deletes a specific nutrition log entry.
 * Uses query parameter 'id' to identify the log entry to delete.
 * Database constraints ensure only the log owner can delete their entries.
 *
 * @param request - Next.js request object with log ID in query params
 * @returns Promise<NextResponse> - Success confirmation or error
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Extract log ID from query parameters
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Delete nutrition log (user ownership verified by foreign key constraints)
    const result = await pool.query(
      "DELETE FROM nutrition_logs WHERE id = $1 AND user_id = $2 RETURNING *",
      [logId, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Nutrition log not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Nutrition log deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting nutrition log:", error);
    return NextResponse.json(
      { error: "Failed to delete nutrition log" },
      { status: 500 }
    );
  }
}