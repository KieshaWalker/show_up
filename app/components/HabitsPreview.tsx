/**
 * Habits Preview Dashboard Component
 *
 * Main dashboard component displaying user's habits with completion tracking,
 * progress visualization, and smart food suggestions. Provides quick-add functionality
 * and integrates with both habit and nutrition tracking systems.
 *
 * Features:
 * - Progress bar showing daily habit completion percentage
 * - Suggestion card recommending frequently-used foods when habits are incomplete
 * - Quick-add form for creating new habits
 * - Real-time habit completion toggling
 * - Responsive design with mobile-friendly interactions
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Yesteryear } from "next/font/google";

/**
 * Habit data structure
 */
interface Habit {
  id: number;
  title: string;
  created_at: string;
  frequency: string;
}

/**
 * Habit log entry structure
 */
interface HabitLog {
  id: number;
  habit_id: number;
  completed: boolean;
  date: string;
}

/**
 * Dashboard data from API
 */
interface DashboardData {
  todayHabits: Array<{habit_id: number, date: string, title: string}>;
  yesterdayHabits: Array<{habit_id: number, date: string, title: string}>;
  totalHabitsCompletedToday: number;
  weeklyNutrition: Array<any>;
}

/**
 * HabitsPreview Component
 *
 * Displays a comprehensive habits dashboard with progress tracking and smart suggestions.
 * Fetches habit data, today's logs, and food usage statistics on mount.
 * Provides interactive habit completion and quick-add functionality.
 *
 * @returns {JSX.Element} Habits preview dashboard
 */
export default function HabitsPreview() {

  // Progress tracking state
  const [totalHabits, setTotalHabits] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Core data state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  /**
   * Initialize component data on mount
   * Fetches habits, today's logs, food usage statistics, and dashboard data
   */
  useEffect(() => {
    fetchHabits();
    fetchTodayLogs();
    fetchDashboardData();
  }, []);

  /**
   * Fetch user's habits from API
   * Updates loading state and handles errors
   */
  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/habits");

      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }

      const data = await response.json();
      const habitsData = data.habits || [];
      setHabits(habitsData);
      setTotalHabits(habitsData.length);
    } catch (error) {
      console.error("Error fetching habits:", error);
      setError("Failed to load habits.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/habits/log?date=${today}`);

      if (response.ok) {
        const data = await response.json();
        const logs = data.habitLogs || [];
        setHabitLogs(logs);
        setCompletedToday(logs.filter((log: HabitLog) => log.completed).length);
      }
    } catch (error) {
      console.error("Error fetching habit logs:", error);
    }
  };



  

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  /**
   * Log habit completion for today
   * Updates or creates habit log entry via API
   * @param habitId - ID of the habit to log
   * @param completed - Whether the habit was completed
   */
  const logHabitCompletion = async (habitId: number, completed: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/habits/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          date: today,
          completed,
        }),
      });

      if (response.ok) {
        await fetchTodayLogs(); // Refresh logs
      } else {
        console.error('Failed to log habit completion');
      }
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  /**
   * Calculate weekly target based on habit frequency
   * @param frequency - The habit frequency setting
   * @returns Number of times the habit should be done per week
   */
  const getWeeklyTarget = (frequency: string): number => {
    switch (frequency) {
      case 'daily': return 7;
      case 'every-other-day': return 4; // 3-4 times per week
      case 'twice-weekly': return 2;
      case 'weekly': return 1;
      case 'monthly': return 0; // Monthly habits don't have weekly targets
      default: return 7;
    }
  };

  /**
   * Get habit completions for today and yesterday
   * @param habitId - ID of the habit to check
   * @returns Object with today and yesterday completion status
   */
  const getRecentCompletions = (habitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayCompleted = habitLogs.some(log =>
      log.habit_id === habitId &&
      log.date === today &&
      log.completed
    );

    const yesterdayCompleted = habitLogs.some(log =>
      log.habit_id === habitId &&
      log.date === yesterday &&
      log.completed
    );


    return { today: todayCompleted, yesterday: yesterdayCompleted };
  };

  /**
   * Calculate remaining weekly completions needed
   * @param habit - The habit object
   * @returns Remaining completions needed this week
   */
  const getRemainingWeekly = (habit: Habit): number => {
    const weeklyTarget = getWeeklyTarget(habit.frequency);
    if (weeklyTarget === 0) return 0; // Monthly habits

    const { today, yesterday } = getRecentCompletions(habit.id);
    const recentCompletions = (today ? 1 : 0) + (yesterday ? 1 : 0);

    return Math.max(0, weeklyTarget - recentCompletions);
  };

 

  /**
   * Handle quick-add habit form submission
   * Creates new habit and refreshes the habits list
   * @param e - Form submission event
   */
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quickAddTitle.trim(),
          frequency: 'daily'
        }),
      });

      if (response.ok) {
        setQuickAddTitle('');
        setShowQuickAdd(false);
        await fetchHabits(); // Refresh habits list
      } else {
        console.error('Failed to add habit');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="glass-card habits-preview">
        <h3 className="preview-title">Your Habits</h3>
        <div className="loading-spinner">Loading habits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card habits-preview">
        <h3 className="preview-title">Your Habits</h3>
        <p className="error-text">{error}</p>
        <Link href="/habits" className="btn btn-primary btn-sm">
          Manage Habits
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card habits-preview">
      <div className="preview-header">
        <h3 className="preview-title">Your Habits</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="btn btn-ghost btn-sm"
          >
            + Quick Add
          </button>
          <Link href="/habits" className="btn btn-ghost btn-sm">
            View All
          </Link>
        </div>
      </div>

      {/* Progress Bar - Shows weekly completion percentage */}
      {totalHabits > 0 && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-text">This Week's Progress</span>
            <span className="progress-count">
              {habits.reduce((total, habit) => {
                const weeklyTarget = getWeeklyTarget(habit.frequency);
                const remaining = getRemainingWeekly(habit);
                return total + (weeklyTarget - remaining);
              }, 0)}/
              {habits.reduce((total, habit) => total + getWeeklyTarget(habit.frequency), 0)} completed
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(() => {
                  const totalWeekly = habits.reduce((total, habit) => total + getWeeklyTarget(habit.frequency), 0);
                  const completedWeekly = habits.reduce((total, habit) => {
                    const weeklyTarget = getWeeklyTarget(habit.frequency);
                    const remaining = getRemainingWeekly(habit);
                    return total + (weeklyTarget - remaining);
                  }, 0);
                  return totalWeekly > 0 ? (completedWeekly / totalWeekly) * 100 : 0;
                })()}%`
              }}
            ></div>
          </div>
        </div>
      )}

    
      {/* Quick Add Form - Toggleable form for creating new habits */}
      {showQuickAdd && (
        <div className="mb-4 p-3 bg-surface-secondary rounded-md">
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              placeholder="Habit name..."
              className="flex-1 form-input text-sm"
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickAdd(false);
                setQuickAddTitle('');
              }}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits yet. Start building better routines!</p>
          <Link href="/habits" className="btn btn-primary btn-sm">
            Add Your First Habit
          </Link>
        </div>
      ) : (
        <div className="habits-grid">
          {habits.slice(0, 3).map((habit) => {
            const { today, yesterday } = getRecentCompletions(habit.id);
            const remainingWeekly = getRemainingWeekly(habit);
            const weeklyTarget = getWeeklyTarget(habit.frequency);
            const isCompleted = today; // Use today's completion status for checkbox

            return (
              <div
                key={habit.id}
                className={`habit-card-preview ${isCompleted ? 'completed' : ''}`}
                onClick={() => logHabitCompletion(habit.id, !isCompleted)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => {
                      e.stopPropagation();
                      logHabitCompletion(habit.id, e.target.checked);
                    }}
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent cursor-pointer"
                  />
                  <h4 className="habit-title">{habit.title}</h4>
                </div>

                {/* Weekly Progress Display */}
                {weeklyTarget > 0 && (
                  <div className="weekly-progress mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`status-dot ${today ? 'completed' : 'pending'}`}>Today</span>
                      <span className={`status-dot ${yesterday ? 'completed' : 'pending'}`}>Yesterday</span>
                      <span className="weekly-count">
                        {remainingWeekly}/{weeklyTarget} left this week
                      </span>
                    </div>
                  </div>
                )}

                <small className="habit-date">
                  {habit.frequency !== 'daily' && `${habit.frequency.replace('-', ' ')} • `}
                  Created {new Date(habit.created_at).toLocaleDateString()}
                </small>
              </div>
            );
          })}
          {habits.length > 3 && (
            <div className="more-habits">
              <Link href="/habits" className="btn btn-secondary btn-sm">
                +{habits.length - 3} more habits
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}