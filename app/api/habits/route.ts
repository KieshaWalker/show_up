import { handleHabitRequest } from "@/app/habits/handler";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getPool } from "../../db";
import { authenticateUser } from "../../utils/auth";

// Handle POST request to add a new habit
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

    let title: string;
    let description: string;
    let frequency: string = 'daily';

    // Check if request is JSON or form data
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

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Insert the habit into the database
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

// Handle GET request to fetch habits for the user
export async function GET() {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

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

// Handle DELETE request to remove a habit
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('id');

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    const pool = getPool();

    // Delete the habit, ensuring it belongs to the user
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

// Handle PUT request to update a habit
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const formData = await request.formData();
    const habitId = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    const pool = getPool();

    // Update the habit, ensuring it belongs to the user
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
