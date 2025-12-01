-- Create the food table for nutrition tracking
-- Run this in your Neon SQL editor or psql

-- If table exists with wrong name, you can rename it:
-- ALTER TABLE food_items RENAME TO food;

-- Or drop and recreate (WARNING: This will delete existing data)
DROP TABLE IF EXISTS food;

CREATE TABLE food (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,  -- TEXT type to accept UUID strings from Stack Auth
  name TEXT NOT NULL,
  serving_size TEXT,
  calories INTEGER,
  protein DECIMAL(10,2),
  total_fat DECIMAL(10,2),
  saturated_fat DECIMAL(10,2),
  trans_fat DECIMAL(10,2),
  cholesterol DECIMAL(10,2),
  sodium DECIMAL(10,2),
  total_carbohydrate DECIMAL(10,2),
  dietary_fiber DECIMAL(10,2),
  total_sugars DECIMAL(10,2),
  added_sugars DECIMAL(10,2),
  vitamin_d DECIMAL(10,2),
  calcium DECIMAL(10,2),
  iron DECIMAL(10,2),
  potassium DECIMAL(10,2),
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_food_user_id ON food(user_id);
