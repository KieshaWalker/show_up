import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../db";
import { authenticateUser } from "../../../utils/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { habitId, date, completed, notes } = await request.json();

    if (!habitId || !date) {
      return NextResponse.json(
        { error: "habitId and date are required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Check if habit belongs to user
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

    // Insert or update habit log
    const query = `
      INSERT INTO habit_logs (habit_id, user_id, date, completed, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (habit_id, date)
      DO UPDATE SET
        completed = EXCLUDED.completed,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      habitId,
      user.id,
      date,
      completed || false,
      notes || null
    ]);

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

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');
    const date = searchParams.get('date');

    const pool = getPool();

    let query = `
      SELECT hl.*, h.title, h.description
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = $1
    `;
    const params = [user.id];

    if (habitId) {
      query += " AND hl.habit_id = $2";
      params.push(habitId);
    }

    if (date) {
      query += ` AND hl.date = $${params.length + 1}`;
      params.push(date);
    }

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