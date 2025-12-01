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

    const { foodId, date, quantity, notes } = await request.json();

    if (!foodId || !date) {
      return NextResponse.json(
        { error: "foodId and date are required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Check if food item belongs to user
    const foodCheck = await pool.query(
      "SELECT id FROM food WHERE id = $1 AND user_id = $2",
      [foodId, user.id]
    );

    if (foodCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Food item not found or access denied" },
        { status: 404 }
      );
    }

    // Insert nutrition log
    const query = `
      INSERT INTO nutrition_logs (food_id, user_id, date, quantity, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      foodId,
      user.id,
      date,
      quantity || 1,
      notes || null
    ]);

    // Get the full food details for the response
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

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const foodId = searchParams.get('foodId');
    const date = searchParams.get('date');

    const pool = getPool();

    let query = `
      SELECT nl.*, f.name, f.calories, f.serving_size, f.protein, f.total_fat, f.total_carbohydrate
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.user_id = $1
    `;
    const params = [user.id];

    if (foodId) {
      query += " AND nl.food_id = $2";
      params.push(foodId);
    }

    if (date) {
      query += ` AND nl.date = $${params.length + 1}`;
      params.push(date);
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Delete the log (will only succeed if it belongs to the user due to foreign key constraints)
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