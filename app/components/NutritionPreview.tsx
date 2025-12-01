"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Nutrition {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
}

export default function NutritionPreview() {
  const [nutritionData, setNutritionData] = useState<Nutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/nutrition");

      if (!response.ok) {
        throw new Error("Failed to fetch nutrition data");
      }

      const data = await response.json();
      setNutritionData(data.nutrition || null);
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      setError("Failed to load nutrition data.");
    } finally {
      setLoading(false);
    }
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
      <h3 className="preview-title">Your Nutrition</h3>
      {nutritionData ?  (
        <div className="nutrition-details">
          <p><strong>Name:</strong> {nutritionData.name}</p>
          <p><strong>Calories:</strong> {nutritionData.calories} kcal</p>
          <p><strong>Protein:</strong> {nutritionData.protein} g</p>
          <p><strong>Carbohydrates:</strong> {nutritionData.carbs} g</p>
          <p><strong>Fats:</strong> {nutritionData.fats} g</p>
          <Link href="/nutrition" className="btn btn-primary btn-sm">
            Manage Nutrition
          </Link>
        </div>
      ) : (
        <p>No nutrition data available.</p>
      )}
    </div>
  );
}