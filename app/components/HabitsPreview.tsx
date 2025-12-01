"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Habit {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function HabitsPreview() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/habits");

      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }

      const data = await response.json();
      setHabits(data.habits || []);
    } catch (error) {
      console.error("Error fetching habits:", error);
      setError("Failed to load habits.");
    } finally {
      setLoading(false);
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
        <Link href="/habits" className="btn btn-ghost btn-sm">
          View All
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits yet. Start building better routines!</p>
          <Link href="/habits" className="btn btn-primary btn-sm">
            Add Your First Habit
          </Link>
        </div>
      ) : (
        <div className="habits-grid">
          {habits.slice(0, 3).map((habit) => (
            <div key={habit.id} className="habit-card-preview">
              <h4 className="habit-title">{habit.title}</h4>
              {habit.description && (
                <p className="habit-description">{habit.description}</p>
              )}
              <small className="habit-date">
                Created {new Date(habit.created_at).toLocaleDateString()}
              </small>
            </div>
          ))}
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