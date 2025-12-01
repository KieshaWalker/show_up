import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../db";
import { authenticateUser } from "../../utils/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    let name: string;
    let serving_size: string;
    let calories: number;
    let protein: number;
    let total_fat: number;
    let saturated_fat: number;
    let trans_fat: number;
    let cholesterol: number;
    let sodium: number;
    let total_carbohydrate: number;
    let dietary_fiber: number;
    let total_sugars: number;
    let added_sugars: number;
    let vitamin_d: number;
    let calcium: number;
    let iron: number;
    let potassium: number;

    // Check if request is JSON or form data
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
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
      const formData = await request.formData();
      name = formData.get("name") as string;
      serving_size = formData.get("serving_size") as string || '1 serving';
      calories = parseFloat(formData.get("calories") as string) || 0;
      protein = parseFloat(formData.get("protein") as string) || 0;
      total_fat = parseFloat(formData.get("total_fat") as string) || 0;
      saturated_fat = parseFloat(formData.get("saturated_fat") as string) || 0;
      trans_fat = parseFloat(formData.get("trans_fat") as string) || 0;
      cholesterol = parseFloat(formData.get("cholesterol") as string) || 0;
      sodium = parseFloat(formData.get("sodium") as string) || 0;
      total_carbohydrate = parseFloat(formData.get("total_carbohydrate") as string) || 0;
      dietary_fiber = parseFloat(formData.get("dietary_fiber") as string) || 0;
      total_sugars = parseFloat(formData.get("total_sugars") as string) || 0;
      added_sugars = parseFloat(formData.get("added_sugars") as string) || 0;
      vitamin_d = parseFloat(formData.get("vitamin_d") as string) || 0;
      calcium = parseFloat(formData.get("calcium") as string) || 0;
      iron = parseFloat(formData.get("iron") as string) || 0;
      potassium = parseFloat(formData.get("potassium") as string) || 0;
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const pool = getPool();

    // Insert the food item into the database
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

// Handle GET request to fetch food items for the user
export async function GET() {
  try {
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const pool = getPool();

    const selectQuery = `
      SELECT * FROM food
      WHERE user_id = $1
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