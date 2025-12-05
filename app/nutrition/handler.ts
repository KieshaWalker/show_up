
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
      const get = (key: string) => (formData as any).get(key) as FormDataEntryValue | null;
      const name = get("name") as string;
      const servingSize = get("serving_size") as string;
      const calories = parseInt(get("calories") as string, 10);
      const protein = parseFloat(get("protein") as string);
      const totalFat = parseFloat(get("total_fat") as string);
      const saturatedFat = parseFloat(get("saturated_fat") as string);
      const transFat = parseFloat(get("trans_fat") as string);
      const cholesterol = parseFloat(get("cholesterol") as string);
      const sodium = parseFloat(get("sodium") as string);
      const totalCarbohydrate = parseFloat(get("total_carbohydrate") as string);
      const dietaryFiber = parseFloat(get("dietary_fiber") as string);
      const totalSugars = parseFloat(get("total_sugars") as string);
      const addedSugars = parseFloat(get("added_sugars") as string);
      const vitaminD = parseFloat(get("vitamin_d") as string);
      const calcium = parseFloat(get("calcium") as string);
      const iron = parseFloat(get("iron") as string);
      const potassium = parseFloat(get("potassium") as string);

      const pool = getPool();

      // Insert the food item into the database
      const insertQuery = `
        INSERT INTO food (
           id, user_id, name, serving_size, calories, protein, total_fat, saturated_fat, trans_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, total_sugars, added_sugars, vitamin_d, calcium, iron, potassium, created_at, count 
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
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
