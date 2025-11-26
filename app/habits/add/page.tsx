// add a habit here
import React from "react";
import {} from "@stackframe/stack";



export default async function AddHabit() {
  return (
    <div className="add-habit-container">
      <h2 className="add-habit-title">Add a New Habit</h2>
      <form className="add-habit-form">
        <label className="form-label">
          Habit Name:
          <input type="text" className="form-input" />
        </label>
        <label className="form-label">
          Description:
          <textarea className="form-textarea"></textarea>
        </label>
        <button type="submit" className="form-button">
          Add Habit
        </button>
      </form>
    </div>
  );
}