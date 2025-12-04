"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Habit {
  id: number;
  title: string;
  created_at: string;
  frequency: string;
  color?: string;
}

interface HabitLog {
  id: number;
  habit_id: number;
  completed: boolean;
  date: string;
}     

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchHabits();
    fetchTodayLogs();
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
      setError("Failed to load habits. Please try again.");
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
        setHabitLogs(data.habitLogs || []);
      }
    } catch (error) {
      console.error("Error fetching habit logs:", error);
    }
  };

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

  const isHabitCompletedToday = (habitId: number) => {
    return habitLogs.some(log => log.habit_id === habitId && log.completed);
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!confirm("Are you sure you want to delete this habit?")) {
      return;
    }

    try {
      const response = await fetch(`/api/habits?id=${habitId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHabits(habits.filter(habit => habit.id !== habitId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete habit");
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
      setError("Failed to delete habit. Please try again.");
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditForm(true);
  };

  const handleUpdateHabit = async (formData: FormData) => {
    if (!editingHabit) return;

    try {
      const data = new FormData();
      data.append("id", editingHabit.id.toString());
      data.append("title", formData.get("title") as string);
      data.append("frequency", formData.get("frequency") as string);
      data.append("color", (formData.get("color") as string) || "#7cf4ff");

      const response = await fetch(`/api/habits`, {
        method: "PUT",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setHabits(habits.map(habit =>
          habit.id === editingHabit.id ? result.habit : habit
        ));
        setShowEditForm(false);
        setEditingHabit(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update habit");
      }
    } catch (error) {
      console.error("Error updating habit:", error);
      setError("Failed to update habit. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="habits-section">
        <div className="content-container">
          <div className="card">
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-64 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-section">
      <div className="content-container">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h1 className="hpage-title">Your Habits</h1>
            <Link href="/habits/add" className="btn btn-primary">
              Add New Habit
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right ml-4 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary mb-4">No habits found. Start building better habits!</p>
              <Link href="/habits/add" className="btn btn-primary">
                Add Your First Habit
              </Link>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.map((habit) => (
                <div key={habit.id} className="habit-card">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={isHabitCompletedToday(habit.id)}
                      onChange={(e) => logHabitCompletion(habit.id, e.target.checked)}
                      className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent"
                    />
                    <h3 className="habit-title">{habit.title}</h3>
                  </div>
                  <div className="habit-stats">
                    <small className="text-tertiary">
                      Created: {new Date(habit.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="btn btn-ghost btn-sm text-error hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showEditForm && editingHabit && (
          <EditHabitModal
            habit={editingHabit}
            onSave={handleUpdateHabit}
            onCancel={() => {
              setShowEditForm(false);
              setEditingHabit(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function EditHabitModal({
  habit,
  onSave,
  onCancel
}: {
  habit: Habit;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSave(formData);
  };

  const colorChoices = [
    { value: '#7cf4ff', label: 'Calm' },
    { value: '#facc15', label: 'Medium' },
    { value: '#f97316', label: 'High' },
    { value: '#ef4444', label: 'Critical' },
  ];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Habit</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Habit Title</label>
            <input
              className="form-input"
              type="text"
              name="title"
              defaultValue={habit.title}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select
              className="form-input"
              name="frequency"
              defaultValue={habit.frequency}
              required
            >
              <option value="daily">Daily</option>
              <option value="every-other-day">Every Other Day (3-4x/week)</option>
              <option value="twice-weekly">Twice Weekly</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority color</label>
            <div className="flex flex-wrap gap-2 text-sm">
              {colorChoices.map((choice, index) => (
                <label key={choice.value} className={`flex items-center gap-2 px-2 py-1 rounded-md border cursor-pointer ${habit.color === choice.value ? 'border-gray-400' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="color"
                    value={choice.value}
                    defaultChecked={habit.color ? habit.color === choice.value : index === 0}
                    className="hidden"
                    required
                  />
                  <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: choice.value }} />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}