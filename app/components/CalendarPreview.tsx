"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CalendarStats {
  totalHabits: number;
  totalNutritionEntries: number;
  recentActivity: Array<{
    date: string;
    habits: number;
    nutrition: number;
  }>;
}

export default function CalendarPreview() {
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarStats();
  }, []);

  const fetchCalendarStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current month data
      const now = new Date();
      const response = await fetch(`/api/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);

      if (!response.ok) {
        throw new Error('Failed to fetch calendar stats');
      }

      const data = await response.json();

      // Calculate stats
      const calendarData = data.calendarData || {};
      const dates = Object.keys(calendarData);

      const recentActivity = dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 7)
        .map(date => ({
          date,
          habits: calendarData[date].habits?.length || 0,
          nutrition: calendarData[date].nutrition?.length || 0
        }));

      setStats({
        totalHabits: data.totalHabits || 0,
        totalNutritionEntries: data.totalNutritionEntries || 0,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching calendar stats:', error);
      setError('Failed to load calendar stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card calendar-preview">
        <h3 className="preview-title">This Month's Activity</h3>
        <div className="loading-spinner">Loading stats...</div>
      </div>
    );
  }

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

  const totalActivity = stats.totalHabits + stats.totalNutritionEntries;
  const recentActivityCount = stats.recentActivity.reduce((sum, day) => sum + day.habits + day.nutrition, 0);

  return (
    <div className="glass-card calendar-preview">
      <div className="preview-header">
        <h3 className="preview-title">This Month's Activity</h3>
        <Link href="/calendar" className="btn btn-ghost btn-sm">
          View Full Calendar
        </Link>
      </div>

      <div className="calendar-stats">
        <div className="stat-item">
          <div className="stat-number">{totalActivity}</div>
          <div className="stat-label">Total Activities</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.totalHabits}</div>
          <div className="stat-label">Habits Created</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.totalNutritionEntries}</div>
          <div className="stat-label">Nutrition Entries</div>
        </div>
      </div>

      {recentActivityCount > 0 && (
        <div className="recent-activity">
          <h4 className="activity-title">Recent Activity</h4>
          <div className="activity-timeline">
            {stats.recentActivity.slice(0, 3).map((day, index) => {
              const totalForDay = day.habits + day.nutrition;
              if (totalForDay === 0) return null;

              return (
                <div key={day.date} className="activity-day">
                  <div className="activity-date">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
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