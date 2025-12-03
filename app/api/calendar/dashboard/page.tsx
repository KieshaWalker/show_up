

// app/api/calendar/dashboard/page.tsx
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { authenticateUser } from "@/app/utils/auth";
import { getPool } from "../../../db";


export default async function DashboardPage() {
    // Authenticate user
    const authResult = await authenticateUser();
        if (authResult instanceof NextResponse) {
            if (authResult.status === 401) {
                redirect("/login");
            }
            throw new Error("Failed to authenticate user");
        }
    const user = authResult;
    
    const pool = getPool();

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    
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
    const todayHabits = habitLogs.filter(log => {
        const logDate = new Date(log.date);
        const logDateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
        return logDateStr === todayStr && log.completed;
    });
    const yesterdayHabits = habitLogs.filter(log => {
        const logDate = new Date(log.date);
        const logDateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
        return logDateStr === yesterdayStr && log.completed;
    });
 console.log("Today's Habits:", todayHabits);
 console.log("Yesterday's Habits:", yesterdayHabits);

 const showHabitsAndLogDates = habitLogs.map(log => {
    const logDate = new Date(log.date);
    const logDateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
    return {
        habit_id: log.habit_id,
        title: log.title,
        date: logDateStr,
        completed: log.completed
    };
 });
 console.log("All Habits and Log Dates:", showHabitsAndLogDates);

    // Fetch today's nutrition logs
    const nutritionLogsQuery = `
      SELECT nl.id, nl.date, nl.quantity, f.name AS food_name
      FROM nutrition_logs nl
      JOIN food f ON nl.food_id = f.id
      WHERE nl.user_id = $1 AND nl.date = $2
    `;
    const nutritionLogsResult = await pool.query(nutritionLogsQuery, [user.id, todayStr]);
    const nutritionLogs = nutritionLogsResult.rows;

    // Calculate summary statistics
    const totalHabitsCompletedToday = habitLogs.filter(log => {
        try {
            // find habits completed that match the same day as todayStr
            const logDate = new Date(log.date);
            const logDateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
            return log.completed && logDateStr === todayStr;
        } catch (error) {
            console.error("Error parsing date for habit log:", log, error);
            return false;
        }
    });

     console.log("Total Habits Completed Today:", totalHabitsCompletedToday.length);

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
        totalHabitsCompletedToday,
        totalNutritionEntries,
        totalCaloriesConsumed
      }
    };

    const weeklyHabits = habitLogs.filter(log => {
        const logDate = new Date(log.date);
        const diffTime = Math.abs(today.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }); 

    console.log("Weekly Habits:", weeklyHabits);


    const weeklyNutrition = nutritionLogs.filter(log => {
        const logDate = new Date(log.date);
        const diffTime = Math.abs(today.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    });
    console.log("Weekly Nutrition:", weeklyNutrition);

   


  return (
    <>
<div className="test">    
        <div className="spacer">    </div>
    <div className="dashboard-container">

      <h1 className="dashboard-title">Today's Overview</h1>

        <div className="summary-cards">
            <div className="summary-card">
                <h2>Today's Overview - {today.toDateString()}</h2>
                <p>Habits completed today: {todayHabits.length}</p>
                <p>Total habits logged: {habitLogs.length}</p>
            </div>
            <div className="summary-card">
                <h2>Yesterday's Overview - {yesterday.toString()}</h2>
                <p>Habits completed yesterday: {yesterdayHabits.length}</p>
            </div>
            <div className="summary-card">
                <h2>Nutrition Entries</h2>
                <p>{totalNutritionEntries}</p>
            </div>
             
        </div>

        {/* Display today's completed habits */}
        {todayHabits.length > 0 && (
            <div className="habits-section">
                <h3>Today's Completed Habits</h3>
                <div className="habits-list">
                    {todayHabits.map((habit) => (
                        <div key={`${habit.habit_id}-${habit.date}`} className="habit-item">
                            <span>{habit.title}</span>
                            <span className="completed-check">✓</span>
                        </div>
                    ))}
                </div>
                 
            </div>
        )}

        {/* Display yesterday's completed habits */}
        {yesterdayHabits.length > 0 && (
            <div className="habits-section">
                <h3>Yesterday's Completed Habits</h3>
                <div className="habits-list">
                    {yesterdayHabits.map((habit) => (
                        <div key={`${habit.habit_id}-${habit.date}`} className="habit-item">
                            <span>{habit.title}</span>
                            <span className="completed-check">✓</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>

</div>

    </>
  );
}
