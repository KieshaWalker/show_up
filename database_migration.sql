-- Create the food table for nutrition tracking
-- Run this in your Neon SQL editor or psql

-- If table exists with wrong name, you can rename it:
-- ALTER TABLE food_items RENAME TO food;

-- Or drop and recreate (WARNING: This will delete existing data)

-- drop table and dependent objects if they exist
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DROP TABLE IF EXISTS habits CASCADE;

-- Create the habits table for habit tracking
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,  -- TEXT type to accept UUID strings from Stack Auth
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  color VARCHAR(7) DEFAULT '#007bff', -- Hex color for habit visualization
  icon VARCHAR(50) DEFAULT 'target', -- Icon name for habit visualization
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
DROP TABLE IF EXISTS food CASCADE;

-- Create the food table for nutrition tracking
CREATE TABLE IF NOT EXISTS food (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  serving_size VARCHAR(100),
  calories INTEGER NOT NULL,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for food table
CREATE INDEX IF NOT EXISTS idx_food_user_id ON food(user_id);
DROP TABLE IF EXISTS habit_logs CASCADE;

-- Create habit_logs table for daily habit tracking
CREATE TABLE IF NOT EXISTS habit_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, date) -- Prevent duplicate entries for same habit on same day
);

-- Create indexes for habit_logs
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

DROP TABLE IF EXISTS nutrition_logs CASCADE;
-- Create nutrition_logs table for daily nutrition tracking
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id SERIAL PRIMARY KEY,
  food_id INTEGER NOT NULL REFERENCES food(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1, -- Number of servings
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for nutrition_logs
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_food_id ON nutrition_logs(food_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON nutrition_logs(date);

DROP TABLE IF EXISTS tasks CASCADE;
-- Create tasks table for task management

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,  -- TEXT type for Stack Auth UUIDs
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_habit_logs_updated_at
    BEFORE UPDATE ON habit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at
    BEFORE UPDATE ON nutrition_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();