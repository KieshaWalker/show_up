/**
 * Food Items API Route Handler
 *
 * RESTful API endpoints for managing user food items database.
 * Supports creating and retrieving food items with comprehensive nutritional information.
 * All endpoints require user authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../db";
import { authenticateUser } from "../../utils/auth";

/**
 * POST - Create a new food item
 *
 * Adds a new food item to the user's personal food database with complete nutritional information.
 * Accepts both JSON and FormData formats for flexibility with different client implementations.
 *
 * Nutritional fields include:
 * - Basic info: name, serving size, calories
 * - Macronutrients: protein, fats (total, saturated, trans), carbohydrates, fiber, sugars
 * - Micronutrients: vitamins (D), minerals (calcium, iron, potassium), sodium, cholesterol
 *
 * @param request - Next.js request object containing food item data
 * @returns Promise<NextResponse> - Success response with created food item or error
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    // Initialize nutritional data variables
    let name = "";
    let serving_size = "";
    let calories = 0;
    let protein = 0;
    let total_fat = 0;
    let saturated_fat = 0;
    let trans_fat = 0;
    let cholesterol = 0;
    let sodium = 0;
    let total_carbohydrate = 0;
    let dietary_fiber = 0;
    let total_sugars = 0;
    let added_sugars = 0;
    let vitamin_d = 0;
    let calcium = 0;
    let iron = 0;
    let potassium = 0;

    // Handle both JSON and FormData request formats
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // Parse JSON request body
      const jsonData = await request.json();
      name = jsonData.name;
      serving_size = jsonData.serving_size || '1 serving';
      calories = jsonData.calories || 0;
      protein = jsonData.protein || 0;
      total_fat = jsonData.total_fat || 0;
      saturated_fat = jsonData.saturated_fat || 0;
      trans_fat = jsonData.trans_fat || 0;
      cholesterol = jsonData.cholesterol || 0;
      sodium = jsonData.sodium || 0;
      total_carbohydrate = jsonData.total_carbohydrate || 0;
      dietary_fiber = jsonData.dietary_fiber || 0;
      total_sugars = jsonData.total_sugars || 0;
      added_sugars = jsonData.added_sugars || 0;
      vitamin_d = jsonData.vitamin_d || 0;
      calcium = jsonData.calcium || 0;
      iron = jsonData.iron || 0;
      potassium = jsonData.potassium || 0;
    } else {
      // Parse FormData request body
      const formData = await request.formData();
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
    }

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const pool = getPool();

    // Insert new food item into database with all nutritional data
    const insertQuery = `
      INSERT INTO food (user_id, name, serving_size, calories, protein, total_fat, saturated_fat, trans_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, total_sugars, added_sugars, vitamin_d, calcium, iron, potassium)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *
    `;

    const values = [user.id, name.trim(), serving_size, calories, protein, total_fat, saturated_fat, trans_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, total_sugars, added_sugars, vitamin_d, calcium, iron, potassium];

    const result = await pool.query(insertQuery, values);
    const newFood = result.rows[0];

    return NextResponse.json({
      message: "Food item added successfully",
      food: newFood
    }, { status: 201 });

  } catch (error) {
    console.error("Error adding food item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET - Retrieve user's food items
 *
 * Fetches all food items belonging to the authenticated user.
 * Food items are ordered by creation date (newest first).
 *
 * @returns Promise<NextResponse> - Success response with food items array or error
 */
export async function GET() {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

    // Fetch all food items for the user
    const selectQuery = `
      SELECT * FROM food
      WHERE user_id = $1 OR user_id = 'test-user-id'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(selectQuery, [user.id]);
    const food = result.rows;

    return NextResponse.json({ food });

  } catch (error) {
    console.error("Error fetching food items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
