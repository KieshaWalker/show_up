// add a habit here
import React from "react";
import {} from "@stackframe/stack";

export default async function AddHabit() {
  return (
    <div className="add-habit-container">
      <h2 className="add-habit-title">Add a New Habit</h2>
      <form action="/api/habits" method="POST"
      className="add-habit-form">
        <label className="add-habit-label">
          Habit Name:
          <input className="form-input" type="text" name="title" required />
        </label>
        <label className="add-habit-label">
          Frequency:
          <select className="form-input" name="frequency" required>
          <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="every-other-day">Every Other Day (3-4x/week)</option>
              <option value="twice-a-week">Twice Weekly</option>
              <option value="three-times-a-week">Three Times a Week</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="monthly">Monthly</option>
          </select>
        </label>
        <fieldset className="add-habit-label">
          <legend className="text-sm font-medium mb-1">Priority color:</legend>
          <div className="flex gap-3 flex-wrap text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="color" value="#7cf4ff" required />
              <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: '#7cf4ff' }} /> Calm
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="color" value="#facc15" required />
              <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: '#facc15' }} /> Medium
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="color" value="#f97316" required />
              <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: '#f97316' }} /> High
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="color" value="#ef4444" required />
              <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: '#ef4444' }} /> Critical
            </label>
          </div>
        </fieldset>
        <button id="add-habit-button" type="submit">Add Habit</button>


      </form>
    </div>
  );
}