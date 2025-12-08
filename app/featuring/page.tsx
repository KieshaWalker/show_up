/**
 * yesterday  Page Component
 *
 * Server component that displays user information in the main dashboard.
 * Conditionally renders sign-in button for guests or user profile for authenticated users.
 *
 * Features:
 * seeing yesterdays info
 *
 */

import { redirect } from 'next/navigation';
import { getPool } from '../db';
import { authenticateUser } from '../utils/auth';
import HabitsBubbles from './HabitsBubbles';

// This page reads authentication cookies; force dynamic rendering to avoid static errors.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
export default async function featuring() {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof Response) {
      redirect('/handler/sign-in');
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

    const habitLogsQuery = `
        SELECT hl.habit_id, hl.user_id, hl.date, hl.completed, hl.completed_on, hl.created_at, hl.updated_at, h.title
        FROM habit_logs hl
        LEFT JOIN habits h ON hl.habit_id = h.id  
        WHERE (hl.user_id = $1 OR hl.user_id = 'test-user-id') AND h.id IS NOT NULL
    `;
    const habitLogsResult = await pool.query(habitLogsQuery, [user.id]);
    const habitLogs = habitLogsResult.rows;

    console.log("Habit Logs:", habitLogs);

    const totalHabitsQuery = `
        SELECT h1.id, h1.title, h1.user_id, h1.color, h1.frequency
        FROM habits h1
        WHERE h1.user_id = $1
    `;
    const totalHabitsResult = await pool.query(totalHabitsQuery, [user.id]);
    const totalHabits = totalHabitsResult.rows;

    console.log("Total Habits:", totalHabits);

  // Weekly multiplier by frequency; extend here if new frequencies are added
  const frequencyWeekMultiplier: Record<string, number> = {
    daily: 7,
    weekly: 1,
    monthly: 0.25,
    'every-other-day': 4,
    'twice-a-week': 2,
    'three-times-a-week': 3,
    weekdays: 5,
    weekends: 2,
  };

  // Keep only habits we know how to score and compute totals dynamically
  const countedHabits = totalHabits.filter((habit: any) => frequencyWeekMultiplier[habit.frequency] !== undefined);
  const totalPossibleHabitsThisWeek = countedHabits.reduce((sum: number, habit: any) => sum + frequencyWeekMultiplier[habit.frequency], 0);

  // Weekly window (Monday start)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getUTCDay();
  const diff = (day + 6) % 7; // days since Monday
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diff);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);

  // Fetch completions for this week
  const weeklyLogsQuery = `
    SELECT habit_id, date, completed
    FROM habit_logs
    WHERE (user_id = $1 OR user_id = 'test-user-id')
      AND date >= $2 AND date < $3
      AND completed = true
  `;
  const weeklyLogsResult = await pool.query(weeklyLogsQuery, [user.id, startOfWeek.toISOString().slice(0, 10), endOfWeek.toISOString().slice(0, 10)]);
  const weeklyLogs = weeklyLogsResult.rows as { habit_id: number; date: string; completed: boolean }[];

  const weeklyCompletedCount = weeklyLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.habit_id] = (acc[log.habit_id] || 0) + 1;
    return acc;
  }, {});

  const habitsWithRemaining = countedHabits.map((habit: any) => {
    const target = frequencyWeekMultiplier[habit.frequency];
    const done = weeklyCompletedCount[habit.id] || 0;
    const remaining = Math.max(target - done, 0);
    const completedToday = weeklyLogs.some((log) => log.habit_id === habit.id && log.date === todayStr && log.completed);
    return { ...habit, weeklyTarget: target, weeklyCompleted: done, remainingThisWeek: remaining, completedToday };
  });

  console.log("Total Possible Habits This Week:", totalPossibleHabitsThisWeek);
  console.log('weekly remaining per habit', habitsWithRemaining.map((h: any) => ({ title: h.title, remaining: h.remainingThisWeek, target: h.weeklyTarget, done: h.weeklyCompleted, today: h.completedToday })));

  // if user clicks on one of the total possible habits this week, it marks it as completed and removes it from that list and shows it as completed
  const completedHabitsThisWeek = habitLogs.filter((log: any) => {
    const logDateKey = toDateKey(log.date);
    const isThisWeek = logDateKey >= toDateKey(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) && logDateKey <= todayStr;
    return log.completed && isThisWeek;
  });

  const uniqueCompletedHabitIds = Array.from(new Set(completedHabitsThisWeek.map((log: any) => log.habit_id)));
  const totalCompletedHabitsThisWeek = uniqueCompletedHabitIds.length;

  console.log("Total Completed Habits This Week:", totalCompletedHabitsThisWeek);


  return (
    <div className="main-content">
      <div className="c-container">
        <HabitsBubbles
          today={todayStr}
          startOfWeek={startOfWeek.toISOString().slice(0, 10)}
          endOfWeek={endOfWeek.toISOString().slice(0, 10)}
          habits={habitsWithRemaining}
          displayName={user.displayName || "you"}
        />
      </div>
    </div>
  );

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return (
      <div className="m-content">
        <div className="content-container">
          <h1 className="page-title fade-in-up">Error Loading Yesterday's Summary</h1>
          <p>There was an error loading your data. Please try again later.</p>
        </div>
      </div>
    );
  }
}