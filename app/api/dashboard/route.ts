/**
 * Dashboard API Route Handler
 *
 * API endpoint for retrieving comprehensive dashboard data including today's and yesterday's
 * habit completions, nutrition logs, weekly trends, and summary statistics.
 * Mirrors the data used in the dashboard page for consistent component integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../db';
import { authenticateUser } from '../../utils/auth';

/**
 * GET - Retrieve dashboard data
 *
 * Fetches comprehensive data for dashboard display including:
 * - All habit logs with habit names
 * - Today's and yesterday's completed habits
 * - Today's nutrition logs with details
 * - Weekly nutrition logs (last 7 days)
 * - Summary statistics and calculations
 *
 * @param request - Next.js request object
 * @returns Promise<NextResponse> - Success response with dashboard data or error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

    // Helper to get a YYYY-MM-DD key in UTC regardless of server timezone
    const toDateKey = (value: Date | string | number) => {
        const date = new Date(value);
        return date.toISOString().split('T')[0];
    };

    // Get today's and yesterday's date keys in UTC to avoid timezone drift
    const today = new Date();
    const todayStr = toDateKey(today);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = toDateKey(yesterday);


    // Fetch today's habit logs with habit names
    const habitLogsQuery = `
        SELECT hl.habit_id, hl.user_id, hl.date, hl.completed, hl.completed_on, hl.created_at, hl.updated_at, h.title
        FROM habit_logs hl
        JOIN habits h ON hl.habit_id = h.id
        WHERE hl.user_id = $1
    `;
    const habitLogsResult = await pool.query(habitLogsQuery, [user.id]);
    const habitLogs = habitLogsResult.rows;

    // Convert database dates to YYYY-MM-DD format for comparison
    const todayHabits = habitLogs.filter(log => toDateKey(log.date) === todayStr && log.completed);
    const yesterdayHabits = habitLogs.filter(log => toDateKey(log.date) === yesterdayStr && log.completed);

    // Fetch today's nutrition logs
    const todayNutritionLogsQuery = `
        SELECT nl.id, nl.date, nl.quantity, nl.meal_type, nl.calories, f.name, f.serving_size AS food_serving_size
        FROM nutrition_logs nl
        JOIN food f ON nl.food_id = f.id
        WHERE nl.user_id = $1 AND nl.date = $2
    `;
    const nutritionLogsResult = await pool.query(todayNutritionLogsQuery, [user.id, todayStr]);
    const nutritionLogs = nutritionLogsResult.rows;

    // Fetch last 7 days of nutrition logs for weekly trends (including yesterday)
    const weeklyNutritionLogsQuery = `
        SELECT nl.id, nl.date, nl.quantity, nl.meal_type, nl.calories, f.name, f.serving_size AS food_serving_size
        FROM nutrition_logs nl
        JOIN food f ON nl.food_id = f.id
        WHERE nl.user_id = $1
            AND nl.date BETWEEN ($2::date - INTERVAL '6 days') AND $2::date
        ORDER BY nl.date DESC
    `;
    const weeklyNutritionResult = await pool.query(weeklyNutritionLogsQuery, [user.id, todayStr]);
    const weeklyNutrition = weeklyNutritionResult.rows;

    // Calculate summary statistics
    const totalHabitsCompletedToday = habitLogs.filter(log => {
        try {
            return log.completed && toDateKey(log.date) === todayStr;
        } catch (error) {
            console.error("Error parsing date for habit log:", log, error);
            return false;
        }
    });

    const totalNutritionEntries = nutritionLogs.length;
    const totalCaloriesConsumed = nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalProteinConsumed = nutritionLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalFatConsumed = nutritionLogs.reduce((sum, log) => sum + (log.total_fat || 0), 0);
    const totalCarbsConsumed = nutritionLogs.reduce((sum, log) => sum + (log.total_carbohydrate || 0), 0);

    const weeklyCalories = weeklyNutrition.reduce((sum, log) => sum + (log.calories || 0), 0);

    const getCaloriesYesterdayTotal = (nutritionLogs: any[]) => {
        // Sum calories for yesterday
        return nutritionLogs
            .filter(log => toDateKey(log.date) === yesterdayStr)
            .reduce((sum, log) => sum + (log.calories || 0), 0);
    };

    const caloriesYesterdayTotal = getCaloriesYesterdayTotal(weeklyNutrition);

    // Return comprehensive dashboard data
    return NextResponse.json({
      todayHabits,
      yesterdayHabits,
      nutritionLogs,
      weeklyNutrition,
      totalHabitsCompletedToday: totalHabitsCompletedToday.length,
      totalNutritionEntries,
      totalCaloriesConsumed,
      totalProteinConsumed,
      totalFatConsumed,
      totalCarbsConsumed,
      weeklyCalories,
      caloriesYesterdayTotal,
      todayStr,
      yesterdayStr
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}