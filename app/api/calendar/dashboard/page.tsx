

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
    // explanation of line 61 - we are fetching nutrition logs for the authenticated user for today's date only
    // explanation of line 62 - we are joining the food table to get food details like name, calories, and serving size
    // explanation of line 63 - we are filtering the nutrition logs by user_id and date to get only today's entries for the authenticated user//
    // explanation of line 64 - we are using parameterized queries to prevent SQL injection attacks

    
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
        const weeklyCalories = weeklyNutrition.reduce((sum, log) => sum + (log.calories || 0), 0);
        const weeklyNutritionName = weeklyNutrition.map(log => log.name);
        const dateEaten = weeklyNutrition.map(log => toDateKey(log.date));


        console.log("Weekly Dates Eaten:", dateEaten);
        console.log("Weekly cals:", weeklyCalories);
        console.log("Weekly Nutrition Names:", weeklyNutritionName);
        console.log("Weekly Nutrition:", weeklyNutrition);


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



    // (weeklyNutrition already computed via query)

    const getCaloriesOverTimeTotal = (weeklyNutrition: any[]) => {
        // Aggregate calories by date
        const caloriesMap: { [key: string]: number } = {};
    
        weeklyNutrition.forEach(log => {
            const dateKey = toDateKey(log.date);
            // Initialize if not present
            if (!caloriesMap[dateKey]) {
                caloriesMap[dateKey] = 0;
            }
            caloriesMap[dateKey] += log.calories || 0;
            // Sum calories for the date
        });
    
        return Object.keys(caloriesMap).map(date => ({
            date,
            calories: caloriesMap[date]
        }));
    };


    const getCaloriesYesterdayTotal = (nutritionLogs: any[]) => {
        // Sum calories for yesterday
        return nutritionLogs
            .filter(log => toDateKey(log.date) === yesterdayStr)
            .reduce((sum, log) => sum + (log.calories || 0), 0);
    };

    const caloriesOverTimeTotal = getCaloriesOverTimeTotal(weeklyNutrition);
    const caloriesYesterdayTotal = getCaloriesYesterdayTotal(weeklyNutrition);

    console.log("Calories Over Time Total:", caloriesOverTimeTotal);
    console.log("Calories Yesterday Total:", caloriesYesterdayTotal);
   


  return (
    <>
<div className="db">    
    <div className="dashboard-container">
    <div className="dashboard-spacing"></div>

    <div className="summary-s">
        {totalHabitsCompletedToday.length > 0 && (
            <div className="summary-card">
                <h3 className="summary-h3">Today's Overview</h3>
                <div className="summary-list">
                    <div className="summary-item">
                        <span className="dashboard-date">{today.toDateString()}</span>
                    </div>
                    {todayHabits.map((habit) => (
                        <div key={`${habit.habit_id}-${habit.date}`} className="summary-item">
                            <span className="habits-completed-today">{habit.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {nutritionLogs.length > 0 && (
            <div className="summary-card">
                <h3 className="summary-h3">Today's Nutrition Entries</h3>
                <div className="summary-list">
                    {nutritionLogs.map((log) => (
                        <div key={log.id} className="summary-item">
                            <span className="habits-completed-today">{log.name} - {log.calories} kcal </span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {(yesterdayHabits.length > 0 || caloriesYesterdayTotal > 0) && (
            <div className="summary-card">
                <h3 className="summary-h3">Yesterday's Overview</h3>
                <div className="summary-list">
                    <div className="summary-item">
                     <span className="dashboard-date">{yesterday.toDateString()}</span>
                    </div>
                    {yesterdayHabits.map((habit) => (
                        <div key={`${habit.habit_id}-${habit.date}`} className="summary-item">
                            <span className="habits-completed-yesterday">{habit.title}</span>
                        </div>
                    ))}
                    {caloriesYesterdayTotal > 0 && (
                        <div className="summary-item">
                            <span className="habits-completed-yesterday">{caloriesYesterdayTotal} kcal</span>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
        </div>
  </div>
    </>
  );
}
