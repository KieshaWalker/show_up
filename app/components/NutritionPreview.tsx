"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FoodItem {
  id: number;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  total_fat: number;
  created_at: string;
}

interface NutritionLog {
  id: number;
  food_id: number;
  quantity: number;
  date: string;
  name: string;
  calories: number;
}

export default function NutritionPreview() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchFoodItems();
    fetchTodayLogs();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/food");

      if (!response.ok) {
        throw new Error("Failed to fetch food items");
      }

      const data = await response.json();
      setFoodItems(data.food || []);
    } catch (error) {
      console.error("Error fetching food items:", error);
      setError("Failed to load food items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/nutrition/log?date=${today}`);

      if (response.ok) {
        const data = await response.json();
        setNutritionLogs(data.nutritionLogs || []);
      }
    } catch (error) {
      console.error("Error fetching nutrition logs:", error);
    }
  };

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
        await fetchTodayLogs();
        setSelectedFood(null);
        setQuantity(1);
      } else {
        console.error('Failed to log food consumption');
      }
    } catch (error) {
      console.error('Error logging food:', error);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) return;

    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: quickAddName.trim(),
          serving_size: '1 serving',
          calories: 100, // Default values for quick add
          protein: 0,
          total_fat: 0,
          saturated_fat: 0,
          trans_fat: 0,
          cholesterol: 0,
          sodium: 0,
          total_carbohydrate: 0,
          dietary_fiber: 0,
          total_sugars: 0,
          added_sugars: 0,
          vitamin_d: 0,
          calcium: 0,
          iron: 0,
          potassium: 0
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQuickAddName('');
        setShowQuickAdd(false);
        await fetchFoodItems();
        // Auto-log the newly created food
        logFoodConsumption(result.food.id, 1);
      } else {
        console.error('Failed to add food item');
      }
    } catch (error) {
      console.error('Error adding food item:', error);
    }
  };

  const getTodayCalories = () => {
    return nutritionLogs.reduce((total, log) => total + (log.calories * log.quantity), 0);
  };

  if (loading) {
    return (
      <div className="glass-card nutrition-preview">
        <h3 className="preview-title">Your Nutrition</h3>
        <div className="loading-spinner">Loading nutrition data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card nutrition-preview">
        <h3 className="preview-title">Your Nutrition</h3>
        <p className="error-text">{error}</p>
        <Link href="/nutrition" className="btn btn-primary btn-sm">
          Manage Nutrition
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card nutrition-preview">
      <div className="preview-header">
        <h3 className="preview-title">Your Nutrition</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="btn btn-ghost btn-sm"
          >
            + Quick Add
          </button>
          <Link href="/nutrition" className="btn btn-ghost btn-sm">
            View All
          </Link>
        </div>
      </div>

      {/* Today's Calories Summary */}
      <div className="calories-summary">
        <div className="calories-number">{getTodayCalories()}</div>
        <div className="calories-label">calories today</div>
      </div>

      {showQuickAdd && (
        <div className="mb-4 p-3 bg-surface-secondary rounded-md">
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              placeholder="Food name..."
              className="flex-1 form-input text-sm"
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Add & Log
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickAdd(false);
                setQuickAddName('');
              }}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Today's Food Log */}
      {nutritionLogs.length > 0 && (
        <div className="food-log">
          <h4 className="food-log-title">Today's Foods</h4>
          <div className="space-y-2">
            {nutritionLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="food-item">
                <span className="food-name">{log.name} ({log.quantity}x)</span>
                <span className="food-calories">{Math.round(log.calories * log.quantity)} cal</span>
              </div>
            ))}
            {nutritionLogs.length > 3 && (
              <div className="text-center text-sm text-secondary">
                +{nutritionLogs.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Food Selection */}
      {foodItems.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Quick Add Food</h4>
          <div className="quick-food-grid">
            {foodItems.slice(0, 6).map((food) => (
              <button
                key={food.id}
                onClick={() => logFoodConsumption(food.id, 1)}
                className="quick-food-button"
              >
                <div className="quick-food-name">{food.name}</div>
                <div className="quick-food-calories">{food.calories} cal</div>
              </button>
            ))}
          </div>
          {foodItems.length > 6 && (
            <Link href="/nutrition" className="text-sm text-accent hover:underline mt-2 inline-block">
              View all foods →
            </Link>
          )}
        </div>
      )}

      {foodItems.length === 0 && !showQuickAdd && (
        <div className="empty-state">
          <p>No food items yet. Start tracking your nutrition!</p>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="btn btn-primary btn-sm"
          >
            Add Your First Food
          </button>
        </div>
      )}
    </div>
  );
}