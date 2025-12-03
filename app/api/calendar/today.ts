

/* this is a tutorial file to show today's calendar entries */
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from   '../../utils/auth';
import { getPool } from '../../db';

/**
 * GET /api/calendar/today
 *
 * Fetches today's habit and nutrition entries for the authenticated user.
 * Returns detailed logs along with summary statistics.
 *
 * - Detailed logs: habit completions and nutrition entries for today
 * - Summary statistics: total habits completed, total nutrition entries, total calories consumed
 *
 * Requires user authentication.
 *
 * @param request - Next.js request object
 * @returns Promise<NextResponse> - Success response with today's calendar data or error
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

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Fetch today's habit logs
    const habitLogsQuery = `
      SELECT hl.id, hl.date, hl.completed, h.title
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = $1 AND hl.date = $2
    `;
    const habitLogsResult = await pool.query(habitLogsQuery, [user.id, todayStr]);
    const habitLogs = habitLogsResult.rows;

    // Fetch today's nutrition logs
    const nutritionLogsQuery = `
      SELECT nl.id, nl.date, nl.quantity, nl.serving_size, nl.calories, f.name AS food_name
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.user_id = $1 AND nl.date = $2
    `;
    const nutritionLogsResult = await pool.query(nutritionLogsQuery, [user.id, todayStr]);
    const nutritionLogs = nutritionLogsResult.rows;

    // Calculate summary statistics
    const totalHabitsCompleted = habitLogs.filter(log => log.completed).length;
    const totalNutritionEntries = nutritionLogs.length;
    const totalCaloriesConsumed = nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalProteinConsumed = nutritionLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalFatConsumed = nutritionLogs.reduce((sum, log) => sum + (log.total_fat || 0), 0);
    const totalCarbsConsumed = nutritionLogs.reduce((sum, log) => sum + (log.total_carbohydrate || 0), 0);

    const totalHabitsUncompleted = habitLogs.filter(log => !log.completed).length;


    // Construct response data
    const responseData = {
      date: todayStr,
      habits: habitLogs,
      nutrition: nutritionLogs,
      summary: {
        totalHabitsCompleted,
        totalNutritionEntries,
        totalCaloriesConsumed
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching today's calendar data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export default {};
// import this into another file by using:
// import todayCalendar from 'app/api/calendar/today';
// the name of this function is GET because it handles GET requests

// you can call the function like this:
// const response = await todayCalendar.GET(request);

// and you will get a NextResponse object back
// you can then use response.json() to get the data
// or response.status to get the status code