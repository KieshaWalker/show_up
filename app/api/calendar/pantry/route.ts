/**
 * Pantry API Route Handler
 *
 * API endpoint for retrieving pantry food items (common/shared foods).
 * Returns food items that are available to all users for nutrition logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../db';
import { authenticateUser } from '../../../utils/auth';

/**
 * GET - Retrieve pantry food items
 *
 * Fetches all common/shared food items from the database.
 * These are food items with user_id = 'all_users' that can be used by any user.
 *
 * @param request - Next.js request object
 * @returns Promise<NextResponse> - Success response with pantry food items or error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (optional for pantry access)
    const authResult = await authenticateUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const pool = getPool();

    // Fetch all pantry items (common foods)
    const pantryQuery = `
      SELECT id, name, serving_size, calories, protein, total_fat, saturated_fat,
             trans_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber,
             total_sugars, added_sugars, vitamin_d, calcium, iron, potassium
      FROM food
      WHERE user_id = 'all_users'
      ORDER BY name
    `;

    const pantryResult = await pool.query(pantryQuery);

    return NextResponse.json({
      food: pantryResult.rows,
      total: pantryResult.rows.length
    });

  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pantry items' },
      { status: 500 }
    );
  }
}