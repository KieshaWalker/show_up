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

/**
 * Habit data structure
 */
interface Habit {
  id: number;
  title: string;
  description: string;
  created_at: string;
  frequency?: string;
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
 * HabitsPreview Component
 *
 * Displays a comprehensive habits dashboard with progress tracking and smart suggestions.
 * Fetches habit data, today's logs, and food usage statistics on mount.
 * Provides interactive habit completion and quick-add functionality.
 *
 * @returns {JSX.Element} Habits preview dashboard
 */
export default function HabitsPreview() {
  // Food usage statistics for smart suggestions
  const [foodUsageStats, setFoodUsageStats] = useState<Array<{id: number, name: string, count: number, calories: number}>>([]);

  // Progress tracking state
  const [totalHabits, setTotalHabits] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

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
   * Fetches habits, today's logs, and food usage statistics
   */
  useEffect(() => {
    fetchHabits();
    fetchTodayLogs();
    fetchFoodUsageStats();
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

  const fetchFoodUsageStats = async () => {
    try {
      // Get all nutrition logs to calculate usage statistics
      const response = await fetch('/api/nutrition/log');

      if (response.ok) {
        const data = await response.json();
        const logs = data.nutritionLogs || [];

        // Count usage by food item
        const usageMap = new Map<number, {name: string, count: number, calories: number}>();
        logs.forEach((log: any) => {
          const existing = usageMap.get(log.food_id) || { name: log.name, count: 0, calories: log.calories };
          usageMap.set(log.food_id, {
            name: existing.name,
            count: existing.count + 1,
            calories: log.calories
          });
        });

        // Convert to sorted array (most used first)
        const sortedStats = Array.from(usageMap.entries())
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 most used foods

        setFoodUsageStats(sortedStats);
      }
    } catch (error) {
      console.error("Error fetching food usage stats:", error);
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
   * Check if a specific habit is completed today
   * @param habitId - ID of the habit to check
   * @returns boolean indicating completion status
   */
  const isHabitCompletedToday = (habitId: number) => {
    return habitLogs.some(log => log.habit_id === habitId && log.completed);
  };

  /**
   * Log food consumption from suggestion card
   * Adds nutrition entry and refreshes usage statistics
   * @param foodId - ID of the food item to log
   * @param quantity - Quantity consumed (default: 1)
   */
  const logFoodConsumption = async (foodId: number, quantity: number = 1) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId,
          date: today,
          quantity,
        }),
      });

      if (response.ok) {
        // Refresh food usage stats after logging
        await fetchFoodUsageStats();
      } else {
        console.error('Failed to log food consumption');
      }
    } catch (error) {
      console.error('Error logging food:', error);
    }
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
          description: '',
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

      {/* Progress Bar - Shows daily completion percentage */}
      {totalHabits > 0 && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-text">Today's Progress</span>
            <span className="progress-count">{completedToday}/{totalHabits}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Suggestion Card - Appears when habits are incomplete and food data exists */}
      {totalHabits > 0 && completedToday < totalHabits && foodUsageStats.length > 0 && (
        <div className="suggestion-card">
          <h4 className="suggestion-title">💡 Complete {totalHabits - completedToday} more habit{totalHabits - completedToday !== 1 ? 's' : ''}!</h4>
          <p className="suggestion-subtitle">Your favorite foods are ready:</p>
          <div className="suggestion-foods">
            {foodUsageStats.slice(0, 3).map((food) => (
              <button
                key={food.id}
                onClick={() => logFoodConsumption(food.id, 1)}
                className="suggestion-food-button"
              >
                <span className="food-name">{food.name}</span>
                <span className="food-calories">{food.calories} cal</span>
                <span className="food-count">{food.count}x logged</span>
              </button>
            ))}
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
            const isCompleted = isHabitCompletedToday(habit.id);
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
                {habit.description && (
                  <p className="habit-description">{habit.description}</p>
                )}
                <small className="habit-date">
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