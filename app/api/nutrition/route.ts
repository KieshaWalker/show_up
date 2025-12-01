import { NextRequest, NextResponse } from "next/server";
import { handleNutritionRequest } from "../../nutrition/handler";
import { stackServerApp } from "@/stack/server";
import { getPool } from "../../db";

// Handle POST request to add a new food item
export async function POST(request: NextRequest) {
  return handleNutritionRequest(request);
}


// Handle GET request to fetch food items for the user
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getPool();

    // Query to get food items for the user
    const query = `
      SELECT * FROM food 
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [user.id]);
    const foodItems = result.rows;

    return NextResponse.json({ foodItems });
    console.log("Fetched food items:", foodItems);
  } catch (error) {
    console.error("Error fetching food items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// Handle DELETE request to remove a food item
export async function DELETE(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const pool = getPool();

    // Delete the food item, ensuring it belongs to the user
    const deleteQuery = `
      DELETE FROM food
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(deleteQuery, [itemId, user.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// Handle PUT request to update a food item
export async function PUT(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const formData = await request.formData();
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

    // Update the food item
    const updateQuery = `
      UPDATE food
      SET name = $1, serving_size = $2, calories = $3, protein = $4, total_fat = $5,
          saturated_fat = $6, trans_fat = $7, cholesterol = $8, sodium = $9,
          total_carbohydrate = $10, dietary_fiber = $11, total_sugars = $12,
          added_sugars = $13, vitamin_d = $14, calcium = $15, iron = $16, potassium = $17
      WHERE id = $18 AND user_id = $19
      RETURNING *
    `;

    const values = [
      name, servingSize, calories, protein, totalFat, saturatedFat, transFat,
      cholesterol, sodium, totalCarbohydrate, dietaryFiber, totalSugars,
      addedSugars, vitaminD, calcium, iron, potassium, itemId, user.id
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Item updated successfully",
      foodItem: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 