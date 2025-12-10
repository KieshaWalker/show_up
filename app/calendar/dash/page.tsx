"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from 'next/navigation';

/**
 * Interface for calendar statistics data structure
 * Contains aggregated data for habits, nutrition, and activity tracking
 */
interface CalendarStats {
  totalHabits: number;              // Total habit completions this month
  totalNutritionEntries: number;    // Total nutrition log entries this month
  totalUniqueHabits: number;        // Number of unique habits created
  totalUniqueFood: number;          // Number of unique food items added
  recentActivity: Array<{           // Recent 7 days activity summary
    date: string;                   // Date in YYYY-MM-DD format
    habits: number;                 // Number of habits completed that day
    nutrition: number;              // Number of nutrition entries that day
  }>;
  calendarData: Record<string, {
    date: string;
    habits: Array<{ id: number; title: string; completed: boolean; date: string }>;
    nutrition: Array<{ id: number; name: string; calories: number; quantity: number; serving_size?: string; date: string }>;
  }>;
  
  // New data from dashboard
  todayHabits: Array<{habit_id: number, date: string, title: string}>;
  yesterdayHabits: Array<{habit_id: number, date: string, title: string}>;
  todayNutrition: Array<{id: number, name: string, quantity: number, calories: number, meal_type: string}>;
  weeklyNutrition: Array<{id: number, date: string, name: string, quantity: number, calories: number, meal_type: string}>;
  totalHabitsCompletedToday: number;
  totalCaloriesConsumed: number;
  totalProteinConsumed: number;
  totalFatConsumed: number;
  totalCarbsConsumed: number;
  weeklyCalories: number;
  caloriesYesterdayTotal: number;
}

/**
 * CalendarPreview Component
 *
 * Displays a preview of the current month's activity statistics including:
 * - Total habit completions and nutrition entries
 * - Unique habits and food items created
 * - Recent activity timeline for the past 7 days
 *
 * This component provides a quick overview of user activity and serves as
 * an entry point to the full calendar view.
 *@param request - Next.js request object
 * @returns JSX.Element - The calendar preview card component
 */
export default async function dash() {
  // State management for calendar statistics, loading, and error states
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Fetch calendar stats on component mount
  useEffect(() => {
    fetchCalendarStats();
  }, []);

  /**
   * Fetch calendar statistics from the API
   * Retrieves current month data and calculates activity summaries
   */
  const fetchCalendarStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current month data from calendar API
      const now = new Date();
      const todayKey = now.toISOString().split('T')[0];
      const calendarResponse = await fetch(`/api/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);

      if (!calendarResponse.ok) {
        throw new Error('Failed to fetch calendar stats');
      }

      const calendarData = await calendarResponse.json();

      // Get dashboard data for today's and yesterday's details
      const dashboardResponse = await fetch('/api/dashboard');

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await dashboardResponse.json();
      console.log("dashboardData:", dashboardData);

      // Process calendar data to extract recent activity
      const calData = calendarData.calendarData || {};

      // Ensure today exists in calendar data using dashboard data, even if calendar query had no entries yet
      if (!calData[todayKey]) {
        calData[todayKey] = {
          date: todayKey,
          habits: [],
          nutrition: []
        };
      }

      // Merge today habits from dashboard
      if (dashboardData.todayHabits?.length) {
        calData[todayKey].habits = dashboardData.todayHabits.map((h: any) => ({
          id: h.habit_id,
          title: h.title,
          completed: true,
          date: h.date
        }));
      }

      // Merge today nutrition from dashboard
      if (dashboardData.nutritionLogs?.length) {
        calData[todayKey].nutrition = dashboardData.nutritionLogs.map((n: any) => ({
          id: n.id,
          name: n.name,
          calories: n.calories,
          quantity: n.quantity,
          serving_size: n.food_serving_size,
          date: n.date
        }));
      }
      const dates = Object.keys(calData);

      // Sort dates descending and take last 7 days
      const recentActivity = dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 7)
        .map(date => ({
          date,
          habits: calData[date].habits?.length || 0,
          nutrition: calData[date].nutrition?.length || 0
        }));

      // Set aggregated statistics with dashboard data
      setStats({
        totalHabits: calendarData.totalHabits || 0,
        totalNutritionEntries: calendarData.totalNutritionEntries || 0,
        totalUniqueHabits: calendarData.totalUniqueHabits || 0,
        totalUniqueFood: calendarData.totalUniqueFood || 0,
        recentActivity,
        calendarData: calData,
        // Dashboard data
        todayHabits: dashboardData.todayHabits || [],
        yesterdayHabits: dashboardData.yesterdayHabits || [],
        todayNutrition: dashboardData.nutritionLogs || [],
        weeklyNutrition: dashboardData.weeklyNutrition || [],
        totalHabitsCompletedToday: dashboardData.totalHabitsCompletedToday || 0,
        totalCaloriesConsumed: dashboardData.totalCaloriesConsumed || 0,
        totalProteinConsumed: dashboardData.totalProteinConsumed || 0,
        totalFatConsumed: dashboardData.totalFatConsumed || 0,
        totalCarbsConsumed: dashboardData.totalCarbsConsumed || 0,
        weeklyCalories: dashboardData.weeklyCalories || 0,
        caloriesYesterdayTotal: dashboardData.caloriesYesterdayTotal || 0
      });
      setActiveDayIndex(0);
    } catch (error) {
      console.error('Error fetching calendar stats:', error);
      setError('Failed to load calendar stats.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state - show spinner while fetching calendar data
  if (loading) {
    return (
      <div className="glass-card calendar-preview">
        <h3 className="preview-title">This Month's Activity</h3>
        <div className="loading-spinner">Loading stats...</div>
      </div>
    );
  }

  // Error state - display error message and link to full calendar
  if (error || !stats) {
    return (
      <div className="glass-card calendar-preview">
        <h3 className="preview-title">This Month's Activity</h3>
        <p className="error-text">{error}</p>
        <Link href="/calendar" className="btn btn-primary btn-sm">
          View Calendar
        </Link>
      </div>
    );
  }

  // Calculate total activity for the month
  const totalActivity = stats.totalHabits + stats.totalNutritionEntries;
  // Calculate recent activity count for the past 7 days
  const recentActivityCount = stats.recentActivity.reduce((sum, day) => sum + day.habits + day.nutrition, 0);

  const toDateKey = (value: string | number | Date) => new Date(value).toISOString().split('T')[0];

  const matchDateWithHabitCompletions = (date: string) => {
    return stats.todayHabits.filter(habit => toDateKey(habit.date) === date);
    // Returns array of habits completed on the given date (YYYY-MM-DD)
  };

  console.log(matchDateWithHabitCompletions('2025-12-08'));

  const handlePrev = () => {
    setActiveDayIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveDayIndex((prev) => Math.min(stats.recentActivity.length - 1, prev + 1));
  };

  const WeekSwipe = ({
    recentActivity,
    calendarData,
    activeDayIndex,
    onPrev,
    onNext,
    setActiveDayIndex,
  }: {
    recentActivity: CalendarStats['recentActivity'];
    calendarData: CalendarStats['calendarData'];
    activeDayIndex: number;
    onPrev: () => void;
    onNext: () => void;
    setActiveDayIndex: React.Dispatch<React.SetStateAction<number>>;
  }) => {
    if (!recentActivity?.length) return null;
    const active = recentActivity[activeDayIndex];
    const dayData = active ? calendarData?.[active.date] : null;

    return (
      <div className="recent-activity" style={{ marginTop: '1rem', gridColumn:'span 2' }}>
        <div className="preview-h" style={{ alignItems: 'center' }}>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <button className="btng" onClick={onPrev} disabled={activeDayIndex === 0} style={{ opacity: activeDayIndex === 0 ? 0.5 : 1 }}>←</button>
            <span style={{ fontSize: '0.9rem' }}>
              {active ? new Date(active.date).toLocaleDateString(undefined, { weekday: 'long' }) : ''}
            </span>
            <button className="btng" onClick={onNext} disabled={activeDayIndex === recentActivity.length - 1} style={{ opacity: activeDayIndex === recentActivity.length - 1 ? 0.5 : 1 }}>→</button>
          </div>
        </div>

        {/* Active day card */}
        {active && (
          <div className="glass-card" style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
            <div className="activity-day" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
              <div className="activity-date" style={{ width: 'fit-content', fontWeight:'bold' }}>
                {new Date(active.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {dayData?.habits?.length ? (
              <div style={{ marginTop: '0.25rem' }}>
                <ul className="activity-list" style={{ display:'grid', gap:'0.3rem', paddingLeft: 0 }}>
                  {dayData.habits.map((habit) => (
                    <li key={habit.id} className="activity-day" style={{ listStyle:'none', padding:'0.35rem 0', borderBottom:'1px solid var(--glass-border)' }}>
                      <div className="activity-count">{habit.title}</div>
                      <span className="activity-badge habits">{habit.completed ? 'Completed' : 'Pending'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="error-text" style={{ marginTop: '0.25rem' }}>No habits logged.</p>
            )}

            {dayData?.nutrition?.length ? (
              <div style={{ marginTop: '0.75rem' }}>
                <h5 className="activity-title" style={{ marginBottom: '0.35rem' }}>Nutrition</h5>
                <ul className="activity-list" style={{ display:'grid', gap:'0.3rem', paddingLeft: 0 }}>
                  {dayData.nutrition.map((entry) => (
                    <li key={entry.id} className="activity-day" style={{ listStyle:'none', padding:'0.35rem 0', borderBottom:'1px solid var(--glass-border)' }}>
                      <div className="activity-count">{entry.name}</div>
                      <span className="activity-badge nutrition">{entry.calories} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="error-text" style={{ marginTop: '0.25rem' }}>No nutrition logged.</p>
            )}
          </div>
        )}

       
      </div>
    );
  };


  return (
    <div className="glass-card calendar-preview" style={{display:'grid', gap:'1rem', gridTemplateColumns:'1fr 1fr'}}>
      {/* Header section with title and navigation link */}
    <div className="calendar-header" style={{gridColumn:'span 2'}}>
      <h3 className="preview-title">Your Activity</h3>
      <Link href="/calendar" className="btn btn-primary btn-sm">
        View Full Calendar
      </Link>
    </div>
 

      {/*week at a glance per day as swipeable cards*/}
        <WeekSwipe
          recentActivity={stats.recentActivity}
          calendarData={stats.calendarData}
          activeDayIndex={activeDayIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          setActiveDayIndex={setActiveDayIndex}
        />


      {/* Empty state - shown when no activity exists for the month */}
      {totalActivity === 0 && (
        <div className="empty-state">
          <p>No activity this month yet. Start building habits and tracking nutrition!</p>
          <div className="empty-actions">
            <Link href="/habits" className="btn btn-primary btn-sm">
              Create Habit
            </Link>
            <Link href="/nutrition" className="btn btn-secondary btn-sm">
              Add Nutrition
            </Link>
          </div>
        </div>
      )}
   
      </div>
  );
}