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
            <option value="every-other-day">Every Other Day (3-4x/week)</option>
            <option value="twice-weekly">Twice Weekly</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <button id="add-habit-button" type="submit">Add Habit</button>


      </form>
    </div>
  );
}