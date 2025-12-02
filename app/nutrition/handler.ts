
// Nutrition handler to process nutrition related requests
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../db";
import { authenticateUser } from "../utils/auth";
import { sources } from "next/dist/compiled/webpack/webpack";

export async function handleNutritionRequest(req: NextRequest) {
  const authResult = await authenticateUser();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const user = authResult;

  if (req.method === "POST") {
    try {
      const formData = await req.formData();
      const name = formData.get("name") as string;
      const servingSize = formData.get("serving_size") as string;
      const calories = parseInt(formData.get("calories") as string, 10);
      const protein = parseFloat(formData.get("protein") as string);
      const totalFat = parseFloat(formData.get("total_fat") as string);
      const saturatedFat = parseFloat(formData.get("saturated_fat") as string);
      const transFat = parseFloat(formData.get("trans_fat") as string);
      const cholesterol = parseFloat(formData.get("cholesterol") as string);
      const sodium = parseFloat(formData.get("sodium") as string);
      const totalCarbohydrate = parseFloat(formData.get("total_carbohydrate") as string);
      const dietaryFiber = parseFloat(formData.get("dietary_fiber") as string);
      const totalSugars = parseFloat(formData.get("total_sugars") as string);
      const addedSugars = parseFloat(formData.get("added_sugars") as string);
      const vitaminD = parseFloat(formData.get("vitamin_d") as string);
      const calcium = parseFloat(formData.get("calcium") as string);
      const iron = parseFloat(formData.get("iron") as string);
      const potassium = parseFloat(formData.get("potassium") as string);

      const pool = getPool();

      // Insert the food item into the database
      const insertQuery = `
        INSERT INTO food (
          user_id, name, serving_size, calories, protein, total_fat,
          saturated_fat, trans_fat, cholesterol, sodium, total_carbohydrate,
          dietary_fiber, total_sugars, added_sugars, vitamin_d, calcium, iron, potassium
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `;

      const values = [
        user.id, name, servingSize, calories, protein, totalFat,
        saturatedFat, transFat, cholesterol, sodium, totalCarbohydrate,
        dietaryFiber, totalSugars, addedSugars, vitaminD, calcium, iron, potassium
      ];

      const result = await pool.query(insertQuery, values);
      const transformed = {...result, source: 'api/food/route.ts'};
      const newFoodItem = result.rows[0];

      // Redirect to home page after successful food item creation
      return NextResponse.redirect(new URL('/', req.url));

    } catch (error) {
      console.error("Error adding food item:", error);
      return NextResponse.json({ error: "Failed to add food item" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
