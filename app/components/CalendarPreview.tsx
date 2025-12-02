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
      const response = await fetch(`/api/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);

      if (!response.ok) {
        throw new Error('Failed to fetch calendar stats');
      }

      const data = await response.json();

      // Process calendar data to extract recent activity
      const calendarData = data.calendarData || {};
      const dates = Object.keys(calendarData);

      // Sort dates descending and take last 7 days
      const recentActivity = dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 7)
        .map(date => ({
          date,
          habits: calendarData[date].habits?.length || 0,
          nutrition: calendarData[date].nutrition?.length || 0
        }));

      // Set aggregated statistics
      setStats({
        totalHabits: data.totalHabits || 0,
        totalNutritionEntries: data.totalNutritionEntries || 0,
        totalUniqueHabits: data.totalUniqueHabits || 0,
        totalUniqueFood: data.totalUniqueFood || 0,
        recentActivity
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
      {/* Header section with title and navigation link */}
      <div className="preview-header">
        <h3 className="preview-title">This Month's Activity</h3>
        <Link href="/calendar" className="btn btn-ghost btn-sm">
          View Full Calendar
        </Link>
      </div>

      {/* Monthly statistics display - three key metrics */}
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
  );
}