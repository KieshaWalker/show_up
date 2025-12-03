/**
 * Calendar API Route Handler
 *
 * API endpoint for retrieving calendar data with habit and nutrition tracking information.
 * Aggregates data by date for calendar visualization, showing completed habits and nutrition entries.
 * Requires user authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../db';
import { authenticateUser } from '../../utils/auth';

/**
 * GET - Retrieve calendar data for a specific month
 *
 * Fetches and aggregates habit completions and nutrition logs for a given month.
 * Organizes data by date for easy calendar display and provides summary statistics.
 *
 * Query Parameters:
 * - year: Year for the calendar data (defaults to current year)
 * - month: Month for the calendar data (1-12, defaults to current month)
 *
 * Response includes:
 * - calendarData: Object keyed by date with habits and nutrition arrays
 * - Summary statistics: total habits, nutrition entries, unique items created
 *
 * @param request - Next.js request object with optional year/month query parameters
 * @returns Promise<NextResponse> - Success response with calendar data or error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Extract and validate query parameters
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Validate date parameters
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Calculate date range for the requested month
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 1); // First day of next month

    // Fetch all habit logs for this month with habit details
    const habitsQuery = `
      SELECT hl.id, hl.date, hl.completed, h.title
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = $1
        AND hl.date >= $2
        AND hl.date < $3
      ORDER BY hl.date DESC, h.title
    `;

    const habitsResult = await pool.query(habitsQuery, [user.id, startDate, endDate]);

    // Fetch all nutrition logs for this month with food details
    const nutritionQuery = `
      SELECT nl.id, nl.date, nl.quantity, f.name, f.calories, f.serving_size
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.user_id = $1
        AND nl.date >= $2
        AND nl.date < $3
      ORDER BY nl.date DESC, f.name
    `;

    const nutritionResult = await pool.query(nutritionQuery, [user.id, startDate, endDate]);

    // Get total unique habits created by this user (for statistics)
    const HabitsQuery = `
      SELECT COUNT(*) as count FROM habits WHERE user_id = $1
    `;

    const HabitsResult = await pool.query(HabitsQuery, [user.id]);

    const totalUniqueHabits = parseInt(HabitsResult.rows[0].count);
    // Get total unique food items created by this user (for statistics)

    const uniqueFoodQuery = `
      SELECT COUNT(*) as count FROM food WHERE user_id = $1
    `;
    const uniqueFoodResult = await pool.query(uniqueFoodQuery, [user.id]);
    const totalUniqueFood = parseInt(uniqueFoodResult.rows[0].count);

    // Organize data by date for calendar display
    const calendarData: { [date: string]: any } = {};

    // Process habit logs and group by date
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
        date: habit.date
      });
    });

    // Process nutrition logs and group by date
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
        date: entry.date
      });
    });

    // Return comprehensive calendar data with statistics
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