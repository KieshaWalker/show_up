import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { getPool } from "../db";

export async function handleHabitRequest(req?: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (req && req.method === "POST") {
    try {
      const formData = await req.formData();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      const pool = getPool();

      // Insert the habit into the database
      const insertQuery = `
        INSERT INTO habits (user_id, title, description)
        VALUES ($1, $2, $3) RETURNING *
      `;

      const values = [user.id, title, description];

      const result = await pool.query(insertQuery, values);
      const newHabit = result.rows[0];

      return NextResponse.json({
        message: "Habit added successfully",
        habit: newHabit
      }, { status: 201 });

    } catch (error) {
      console.error("Error adding habit:", error);
      const insertQuery_create_table = `
        CREATE TABLE IF NOT EXISTS habits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // For GET requests, fetch the user's habits
  try {
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