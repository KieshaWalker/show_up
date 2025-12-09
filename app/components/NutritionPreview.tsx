/**
 * Nutrition Preview Dashboard Component
 *
 * Main dashboard component displaying user's nutrition tracking with food logging,
 * calorie counting, and quick-add functionality. Shows today's nutrition summary
 * and provides easy access to food consumption logging.
 *
 * Features:
 * - Today's calorie summary with visual display
 * - Quick-add food functionality with searchable food database
 * - Recent food consumption logs
 * - Integration with nutrition API for logging and retrieval
 * - Responsive design with mobile-friendly interactions
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Food item data structure from user's personal food database
 */
interface FoodItem {
  id: number;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  total_fat: number;
  created_at: string;
}

/**
 * Nutrition log entry structure with food details
 */
interface NutritionLog {
  id: number;
  food_id: number;
  quantity: number;
  date: string;
  name: string;
  calories: number;
}

/**
 * Dashboard data from API
 */
interface DashboardData {
  nutritionLogs: Array<{id: number, name: string, quantity: number, calories: number, meal_type: string}>;
  weeklyNutrition: Array<{id: number, date: string, name: string, quantity: number, calories: number, meal_type: string}>;
  totalCaloriesConsumed: number;
  totalProteinConsumed: number;
  totalFatConsumed: number;
  totalCarbsConsumed: number;
  weeklyCalories: number;
  caloriesYesterdayTotal: number;
}

/**
 * NutritionPreview Component
 *
 * Displays a comprehensive nutrition dashboard with food logging capabilities.
 * Fetches food items and today's nutrition logs on mount for immediate display.
 * Provides interactive food selection and quantity logging.
 *
 * @returns {JSX.Element} Nutrition preview dashboard
 */
export default function NutritionPreview() {
  // Food database state
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodUsageStats, setFoodUsageStats] = useState<Array<{id: number, name: string, count: number, calories: number}>>([]);
  

  // Today's nutrition logs
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');

  // Food logging state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Pantry food items map
    const [pantryMap, setPantryMap] = useState<Map<number, FoodItem>>(new Map());


  /**
   * Initialize component data on mount
   * Fetches food items, today's nutrition logs, and dashboard data
   */
  useEffect(() => {
    fetchFoodItems();
    fetchTodayLogs();
    fetchDashboardData();
    fetchFoodUsageStats();
    fetchPantryItems();
  }, []);

  /**
   * Fetch user's food items from personal database
   * Updates loading state and handles errors
   */
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
  console.log('Food Usage Stats:', foodUsageStats);

  /**
   * Fetch today's nutrition logs
   * Retrieves all food consumption entries for the current date
   */
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

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // fetching foods as a food pantry option, this will open up as a pop up, to add foods from the pantry. 
  // the user will be able to see their top used foods from the pantry and if they need to see more they can click on the pop up.
  // we will use all users food database for this feature.

  /**
   * Fetch pantry food items from shared database
   * Loads common food items available to all users
   */
  const fetchPantryItems = async () => {
    try {
      const response = await fetch('/api/calendar/pantry');

      if (response.ok) {
        const data = await response.json();
        const pantryItems = data.food || [];
        const pantryMap = new Map<number, FoodItem>();
        pantryItems.forEach((item: FoodItem) => {
          pantryMap.set(item.id, item);
        });
        setPantryMap(pantryMap);
      }
    } catch (error) {
      console.error("Error fetching pantry items:", error);
    }
  };
  const handlePantryClick = async (foodId: number) => {
    if (foodId) {
      logFoodConsumption(foodId, 1);
    }
  };



  /**
   * Log food consumption for today
   * Records food intake and refreshes today's logs
   * @param foodId - ID of the food item being logged
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
  console.log('NutritionPreview render:', { foodItems, nutritionLogs, dashboardData });

  /**
   * Handle quick-add food form submission
   * Creates new food item and refreshes the food list
   * @param e - Form submission event
   */
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
console.log('stats', foodUsageStats.length) 
console.log('NutritionPreview render:', { foodItems, nutritionLogs, dashboardData });

  /**
   * Calculate total calories consumed today
   * Sums up calories from all logged food items
   * @returns Total calories for the day
   */
  const getTodayCalories = () => {
    return nutritionLogs.reduce((total, log) => total + (log.calories * log.quantity), 0);
  };

  // Loading state - show spinner while fetching data
  if (loading) {
    return (
      <div className="glass-card nutrition-preview">
        <h3 className="preview-title">Your Nutrition</h3>
        <div className="loading-spinner">Loading nutrition data...</div>
      </div>
    );
  }

  // Error state - display error message and link to full nutrition page
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
    <div className="glass-card calendar-preview">
      {/* Header section with title and action buttons */}
      <div className="preview-header">
        
        <h3 className="pantry-title">Today's Nutrition
           </h3>
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
      {/* Daily calorie summary display */}
      <div className="calories-summary">
        <div className="pantry-title">{getTodayCalories()}</div>
        <div className="pantry-title">calories today</div>
      </div>

      
      {/* Suggestion Card - Appears when habits need weekly completion and food data exists */}
          <p className="suggestion-subtitle">Your favorite foods are ready:</p>
          <div className="div">
          <div className="suggestion-foods">
            {foodUsageStats.slice(0, 3).map((food) => (
              <button
                key={food.id}
                onClick={() => logFoodConsumption(food.id, 1)}
                className="suggestion-food-button"
              >
                <span className="food-name">{food.name}</span>
                <span className="food-calories">{food.calories} cal</span>
                <span className="food-calories">{food.count}x logged</span>
              </button>
            ))}
          </div>
          </div>
       
    
        <h4 className="pantry-title">Pantry</h4>
        <div className="div">
        <div className="suggestion-foods">
          {Array.from(pantryMap.values()).slice(0, 8).map((food) => (
            <button
              key={food.id}
              onClick={() => handlePantryClick(food.id)}
              className="suggestion-food-button"
            >
              <span className="food-name">{food.name}</span>
              <span className="food-calories">{food.calories} cal</span>
            </button>
          ))}     
           </div>
        </div>

      {/* Quick add food form - conditionally rendered */}
      {showQuickAdd && (
        <div className="mb-4 p-3 bg-surface-secondary rounded-md">
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              placeholder="Food name..."
              className="quick-nutrition-input"
              required
            />
            <button type="submit" className="btn-q-a">
              Add & Log
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickAdd(false);
                setQuickAddName('');
              }}
              className="btn-q-a"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

<div className="nut-title">
      {/* Today's food consumption log - shows recent items */}
      {nutritionLogs.length > 0 && (
        <div className="food-log">
          <h4 className="pantry-title">Today's Foods</h4>
          <div className="space-y-2">
            {nutritionLogs.slice(0, 15).map((log) => (
              <div key={log.id} className="food-item">
                <span className="food-name">{log.name} ({log.quantity}x)</span>
                <span className="food-calories">{Math.round(log.calories * log.quantity)} cal</span>
              </div>
            ))}
            {nutritionLogs.length && (
              <div className="text-center text-sm text-secondary">
                +{nutritionLogs.length} more items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
   
  );
}