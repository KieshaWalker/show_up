"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
 *
 * @returns JSX.Element - The calendar preview card component
 */
export default function CalendarPreview() {
  // State management for calendar statistics, loading, and error states
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Process calendar data to extract recent activity
      const calData = calendarData.calendarData || {};
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

  return (
    <div className="glass-card calendar-preview">
      <div className="nut-title">

      {/* Header section with title and navigation link */}
      <div className="preview-h">
        <h3 className="pantry-title">This Month's Activity</h3>
        <Link href="/calendar" className="btn btn-ghost btn-sm">
          View Full Calendar
        </Link>
      </div>
      <div className="calendar-stats">
        <div className="stat-item">
          <div className="stat-number">{totalActivity}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.totalUniqueHabits}</div>
          <div className="stat-label">Habits Created</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.totalUniqueFood}</div>
          <div className="stat-label">Foods Added</div>
        </div>
      </div>

      {stats.weeklyCalories > 0 && (
        <div className="weekly-s">
          <h4 className="activity-title">Weekly Nutrition</h4>
          <div className="stat-item">
            <div className="stat-number">{stats.weeklyCalories}</div>
            <div className="stat-label">Total Calories</div>
          </div>
        </div>
      )}

      {/* Recent activity timeline - shows last 3 active days */}
      {recentActivityCount > 0 && (
        <div className="recent-activity">
          <h4 className="activity-title">Recent Activity</h4>
          <div className="activity-timeline">
            {stats.recentActivity.slice(0, 3).map((day, index) => {
              const totalForDay = day.habits + day.nutrition;
              // Skip days with no activity
              if (totalForDay === 0) return null;

              return (
                <div key={day.date} className="activity-day">
                  {/* Display date in short format (e.g., "Jan 15") */}
                  <div className="activity-date">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  {/* Activity indicators for habits and nutrition */}
                  <div className="activity-indicators">
                    {day.habits > 0 && (
                      <span className="activity-badge habits">
                        {day.habits} habit{day.habits !== 1 ? 's' : ''}
                      </span>
                    )}
                    {day.nutrition > 0 && (
                      <span className="activity-badge nutrition">
                        {day.nutrition} meal{day.nutrition !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      </div>
  );
}