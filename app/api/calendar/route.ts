import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../db';
import { authenticateUser } from '../../utils/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Fetch habit logs for this month
    const habitsQuery = `
      SELECT hl.id, hl.date, hl.completed, hl.notes, h.title, h.description
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = $1
        AND hl.date >= $2
        AND hl.date < $3
      ORDER BY hl.date DESC, h.title
    `;

    const habitsResult = await pool.query(habitsQuery, [user.id, startDate, endDate]);

    // Fetch nutrition logs for this month
    const nutritionQuery = `
      SELECT nl.id, nl.date, nl.quantity, nl.notes, f.name, f.calories, f.serving_size
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.user_id = $1
        AND nl.date >= $2
        AND nl.date < $3
      ORDER BY nl.date DESC, f.name
    `;

    const nutritionResult = await pool.query(nutritionQuery, [user.id, startDate, endDate]);

    // Get count of unique habits created by this user
    const uniqueHabitsQuery = `
      SELECT COUNT(*) as count FROM habits WHERE user_id = $1
    `;
    const uniqueHabitsResult = await pool.query(uniqueHabitsQuery, [user.id]);
    const totalUniqueHabits = parseInt(uniqueHabitsResult.rows[0].count);

    // Get count of unique food items created by this user
    const uniqueFoodQuery = `
      SELECT COUNT(*) as count FROM food WHERE user_id = $1
    `;
    const uniqueFoodResult = await pool.query(uniqueFoodQuery, [user.id]);
    const totalUniqueFood = parseInt(uniqueFoodResult.rows[0].count);

    // Organize data by date
    const calendarData: { [date: string]: any } = {};

    // Process habits
    habitsResult.rows.forEach(habit => {
      const dateKey = habit.date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          habits: [],
          nutrition: []
        };
      }
      calendarData[dateKey].habits.push({
        id: habit.id,
        title: habit.title,
        completed: habit.completed,
        notes: habit.notes,
        date: habit.date
      });
    });

    // Process nutrition entries
    nutritionResult.rows.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          habits: [],
          nutrition: []
        };
      }
      calendarData[dateKey].nutrition.push({
        id: entry.id,
        name: entry.name,
        calories: entry.calories,
        quantity: entry.quantity,
        serving_size: entry.serving_size,
        notes: entry.notes,
        date: entry.date
      });
    });

    return NextResponse.json({
      calendarData,
      month,
      year,
      totalHabits: habitsResult.rows.length,
      totalNutritionEntries: nutritionResult.rows.length,
      totalUniqueHabits: totalUniqueHabits,
      totalUniqueFood: totalUniqueFood
    });

  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}