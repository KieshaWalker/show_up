/**
 * Habits API Route Handler
 *
 * RESTful API endpoints for managing user habits.
 * Supports CRUD operations: Create, Read, Update, Delete habits.
 * All endpoints require user authentication.
 */

import { handleHabitRequest } from "@/app/habits/handler";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getPool } from "../../db";
import { authenticateUser } from "../../utils/auth";

/**
 * POST - Create a new habit
 *
 * Creates a new habit for the authenticated user.
 * Accepts both JSON and FormData formats for flexibility.
 *
 * @param request - Next.js request object containing habit data
 * @returns Promise<NextResponse> - Success response with created habit or error
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user - returns user object or unauthorized response
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

    let title: string;
    let description: string;
    let frequency: string = 'daily';

    // Handle both JSON and FormData request formats
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const jsonData = await request.json();
      title = jsonData.title;
      description = jsonData.description || '';
      frequency = jsonData.frequency || 'daily';
    } else {
      const formData = await request.formData();
      title = formData.get("title") as string;
      description = formData.get("description") as string || '';
      frequency = formData.get("frequency") as string || 'daily';
    }

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Insert new habit into database
    const insertQuery = `
      INSERT INTO habits (user_id, title, description, frequency)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;

    const values = [user.id, title.trim(), description.trim(), frequency];

    const result = await pool.query(insertQuery, values);
    const newHabit = result.rows[0];

    return NextResponse.json({
      message: "Habit added successfully",
      habit: newHabit
    }, { status: 201 });

  } catch (error) {
    console.error("Error adding habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET - Retrieve user's habits
 *
 * Fetches all habits belonging to the authenticated user.
 * Habits are ordered by creation date (newest first).
 *
 * @returns Promise<NextResponse> - Success response with habits array or error
 */
export async function GET() {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

    // Fetch all habits for the user
    const selectQuery = `
      SELECT * FROM habits
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(selectQuery, [user.id]);
    const habits = result.rows;

    return NextResponse.json({ habits });

  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE - Remove a habit
 *
 * Deletes a specific habit belonging to the authenticated user.
 * Uses query parameter 'id' to identify the habit to delete.
 *
 * @param request - Next.js request object with habit ID in query params
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

    // Extract habit ID from query parameters
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('id');

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    const pool = getPool();

    // Delete habit (ensures user owns the habit for security)
    const deleteQuery = `
      DELETE FROM habits
      WHERE id = $1 AND user_id = $2
    `;

    await pool.query(deleteQuery, [habitId, user.id]);

    return NextResponse.json({ message: "Habit deleted successfully" });

  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT - Update a habit
 *
 * Updates an existing habit's title and description.
 * Requires habit ID and ensures user owns the habit.
 *
 * @param request - Next.js request object with updated habit data
 * @returns Promise<NextResponse> - Success response with updated habit or error
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Parse form data
    const formData = await request.formData();
    const habitId = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    const pool = getPool();

    // Update habit (ensures user owns the habit for security)
    const updateQuery = `
      UPDATE habits
      SET title = $1, description = $2
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;

    const values = [title, description, habitId, user.id];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Habit not found or not authorized" }, { status: 404 });
    }

    const updatedHabit = result.rows[0];

    return NextResponse.json({
      message: "Habit updated successfully",
      habit: updatedHabit
    });

  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
