// add a habit here
import React from "react";
import {} from "@stackframe/stack";

import { handleHabitRequest } from "../handler";

export default async function AddHabit() {
  return (
    <div className="add-habit-container">
      <h2 className="add-habit-title">Add a New Habit</h2>
      <form action="/api/habit" method="POST"
      className="add-habit-form">
        <label className="add-habit-label">
          Habit Name:
          <input className="form-input" type="text" name="title" required />
        </label>
        <label className="add-habit-label">
          Description:
          <input className="form-input" type="text" name="description" required />
        </label>
        <label className="add-habit-label">
          Frequency:
          <select className="form-input" name="frequency" required>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <button id="add-habit-button" type="submit">Add Habit</button>


      </form>
    </div>
  );
}