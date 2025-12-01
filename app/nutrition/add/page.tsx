"use client";

// ...existing code...

import { handleNutritionRequest } from "../handler";

export default function AddNutritionPage() {

  
  return (
    <main className="nutrition-card">
      <h1>Add New Food Item</h1>
      <form action="/api/nutrition" method="POST" className="nutrition-input-form">
        <label>
          Food Name:
          <input className="label-input" type="text" name="name" required />
        </label>
        <label>
          Serving Size:
          <input className="label-input" type="text" name="serving_size" required />
        </label>
        <label>
          Calories:
          <input className="label-input" type="number" name="calories" required />
        </label>
        <label>
          Protein (g):
          <input className="label-input" type="number" step="0.1" name="protein" required />
        </label>
        <label>
          Total Fat (g):
          <input className="label-input" type="number" step="0.1" name="total_fat" required />
        </label>
        <label>
          Saturated Fat (g):
          <input className="label-input" type="number" step="0.1" name="saturated_fat" required />
        </label>
        <label>
          Trans Fat (g):
          <input className="label-input" type="number" step="0.1" name="trans_fat" required />
        </label>
        <label>
          Cholesterol (mg):
          <input className="label-input" type="number" step="0.1" name="cholesterol" required />
        </label>
        <label>
          Sodium (mg):
          <input className="label-input" type="number" step="0.1" name="sodium" required />
        </label>
        <label>
          Total Carbohydrate (g):
          <input className="label-input" type="number" step="0.1" name="total_carbohydrate" required />
        </label>
        <label>
          Dietary Fiber (g):
          <input className="label-input" type="number" step="0.1" name="dietary_fiber" required />
        </label>
        <label>
          Total Sugars (g):
          <input className="label-input" type="number" step="0.1" name="total_sugars" required />
        </label>
        <label>
          Added Sugars (g):
          <input className="label-input" type="number" step="0.1" name="added_sugars" required />
        </label>
        <label>
          Vitamin D (mcg):
          <input className="label-input" type="number" step="0.1" name="vitamin_d" required />
        </label>
        <label>
          Calcium (mg):
          <input className="label-input" type="number" step="0.1" name="calcium" required />
        </label>
        <label>
          Iron (mg):
          <input className="label-input" type="number" step="0.1" name="iron" required />
        </label>
        <label>
          Potassium (mg):
          <input className="label-input" type="number" step="0.1" name="potassium" required />
        </label>

        <button className="label-button" type="submit"> Add Food Item</button> {/* Updated button class */}
      </form>
    </main>
  );
}
