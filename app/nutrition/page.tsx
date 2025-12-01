"use client";

import { handleNutritionRequest } from "./handler";
import Link from "next/link";
import AddNutritionPage from "./add/page";
import React, { useState, useEffect } from "react";
import { getPool } from "../db";

interface FoodItem {
  id: number;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  total_fat: number;
  saturated_fat: number;
  trans_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrate: number;
  dietary_fiber: number;
  total_sugars: number;
  added_sugars: number;
  vitamin_d: number;
  calcium: number;
  iron: number;
  potassium: number;
}

export default function NutritionPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch('/api/nutrition');
      if (response.ok) {
        const data = await response.json();
        setFoodItems(data.foodItems || []);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/nutrition?id=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFoodItems(foodItems.filter(item => item.id !== itemId));
        alert('Food item deleted successfully!');
      } else {
        alert('Failed to delete food item.');
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
      alert('Error deleting food item.');
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/nutrition?id=${editingItem.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFoodItems(foodItems.map(item =>
          item.id === editingItem.id ? data.foodItem : item
        ));
        setShowEditForm(false);
        setEditingItem(null);
        alert('Food item updated successfully!');
      } else {
        alert('Failed to update food item.');
      }
    } catch (error) {
      console.error('Error updating food item:', error);
      alert('Error updating food item.');
    }
  };

  if (loading) {
    return (
      <div className="nutrition-page-container">
        <h1 className="nutrition-page-title">Nutrition Tracker</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="nutrition-page-container">
      <h1 className="nutrition-page-title">Nutrition Tracker</h1>

      <Link href="/nutrition/add" className="glass-button">
        Add New Food Item
      </Link>

      <div className="nutrition-items-list">
        {foodItems.length === 0 ? (
          <p className="text-light-brown">No food items added yet. <Link href="/nutrition/add">Add your first item!</Link></p>
        ) : (
          <div className="glass-card">
            <table className="nutrition-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Serving Size</th>
                  <th>Calories</th>
                  <th>Protein (g)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((food) => (
                  <tr key={food.id}>
                    <td>{food.name}</td>
                    <td>{food.serving_size}</td>
                    <td>{food.calories}</td>
                    <td>{food.protein}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(food)}
                        className="glass-button action-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="glass-button action-btn delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditForm && editingItem && (
        <EditFoodModal
          item={editingItem}
          onSave={handleUpdate}
          onCancel={() => {
            setShowEditForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function EditFoodModal({
  item,
  onSave,
  onCancel
}: {
  item: FoodItem;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Food Item</h2>
        <form onSubmit={handleSubmit} className="nutrition-input-form">
          <label>
            Food Name:
            <input
              className="label-input"
              type="text"
              name="name"
              defaultValue={item.name}
              required
            />
          </label>
          <label>
            Serving Size:
            <input
              className="label-input"
              type="text"
              name="serving_size"
              defaultValue={item.serving_size}
              required
            />
          </label>
          <label>
            Calories:
            <input
              className="label-input"
              type="number"
              name="calories"
              defaultValue={item.calories}
              required
            />
          </label>
          <label>
            Protein (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="protein"
              defaultValue={item.protein}
              required
            />
          </label>
          <label>
            Total Fat (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="total_fat"
              defaultValue={item.total_fat}
              required
            />
          </label>
          <label>
            Saturated Fat (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="saturated_fat"
              defaultValue={item.saturated_fat}
              required
            />
          </label>
          <label>
            Trans Fat (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="trans_fat"
              defaultValue={item.trans_fat}
              required
            />
          </label>
          <label>
            Cholesterol (mg):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="cholesterol"
              defaultValue={item.cholesterol}
              required
            />
          </label>
          <label>
            Sodium (mg):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="sodium"
              defaultValue={item.sodium}
              required
            />
          </label>
          <label>
            Total Carbohydrate (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="total_carbohydrate"
              defaultValue={item.total_carbohydrate}
              required
            />
          </label>
          <label>
            Dietary Fiber (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="dietary_fiber"
              defaultValue={item.dietary_fiber}
              required
            />
          </label>
          <label>
            Total Sugars (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="total_sugars"
              defaultValue={item.total_sugars}
              required
            />
          </label>
          <label>
            Added Sugars (g):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="added_sugars"
              defaultValue={item.added_sugars}
              required
            />
          </label>
          <label>
            Vitamin D (mcg):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="vitamin_d"
              defaultValue={item.vitamin_d}
              required
            />
          </label>
          <label>
            Calcium (mg):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="calcium"
              defaultValue={item.calcium}
              required
            />
          </label>
          <label>
            Iron (mg):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="iron"
              defaultValue={item.iron}
              required
            />
          </label>
          <label>
            Potassium (mg):
            <input
              className="label-input"
              type="number"
              step="0.1"
              name="potassium"
              defaultValue={item.potassium}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="glass-button cancel-btn">
              Cancel
            </button>
            <button type="submit" className="glass-button save-btn">
              Update Food Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}