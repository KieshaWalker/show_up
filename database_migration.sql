-- Create the food table for nutrition tracking
-- Run this in your Neon SQL editor or psql

-- If table exists with wrong name, you can rename it:
-- ALTER TABLE food_items RENAME TO food;

-- Or drop and recreate (WARNING: This will delete existing data)

-- drop table and dependent objects if they exist


/*
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
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'every-other-day', 'twice-a-week', 'three-times-a-week', 'weekdays', 'weekends')),
  color VARCHAR(7) DEFAULT '#007bff', -- Hex color for habit visualization
  icon VARCHAR(50) DEFAULT 'target', -- Icon name for habit visualization
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, title) -- Prevent duplicate habit titles per user
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  count INTEGER DEFAULT 0
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
  completed_on DATE[] DEFAULT ARRAY[]::DATE[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, user_id, date), -- Prevent duplicate entries for same habit on same day, PER USER, 
  count INTEGER DEFAULT 0
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  count INTEGER DEFAULT 0
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  count INTEGER DEFAULT 0
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

  */
  

--- create a habit model that links to the user model via user id
-- create a habit log model that links to the habit model via habit id and user id
-- creates a tracking log for each day a habit is completed
--- shows if completed yesterday, and if reoccurring habit, shows streak count
-- the user should be able to color code habits and assign icons to them for visual tracking
-- the user cna choose the frequency of the habit: daily, every other day, twice a week, three times a week, weekly, biweekly, monthly
-- the user can set reminders for habits via email or push notifications
-- for this habit model we will need to create a many-to-one relationship between habits and users
-- here is the model structure:
-- Habit: id, user_id, title, frequency, color, icon, is_active, created_at
-- HabitLog: id, habit_id, user_id, date, completed, notes, created_at, updated_at


-- here are some additional features to consider:
-- the user can view habit completion history and trends over time
-- the user can categorize habits (health, productivity, learning, etc.)


-- create a food model that links to the user model via user id
-- create a nutrition log model that links to the food model via food id and user id
-- creates a daily log of food consumed with nutritional information
-- the user can input food items manually or select from a predefined list
-- the user can set daily nutritional goals and track progress towards those goals
-- the user can view historical nutrition data and trends over time
-- the user can see what they ate yesterday and compare to today
-- the user can set reminders to log their meals
-- the user can see total calories, protein, fat, carbs, etc. consumed each day
-- the user can categorize food items (breakfast, lunch, dinner, snacks)

-- create a task model that links to the user model via user id
-- creates a task management system for users to create, update, delete, and view tasks
-- the user can set due dates, priorities, and completion status for each task
-- the user can view tasks in a list or calendar view
-- the user can receive reminders for upcoming tasks via email or push notifications


--- create a performance optimization plan for queries related to habits, nutrition, and tasks
-- create indexes on frequently queried fields such as user id, date, and completion status
-- analyze query performance and optimize as needed
-- consider caching frequently accessed data for improved performance



-- fake data for testing habits and habit logs for yesterday and today for current user id 1


/*

INSERT INTO habit_logs (habit_id, user_id, date, completed, created_at, updated_at) VALUES
(3, '8d3dc861-b08e-4c12-98d3-02ae483e641f', CURRENT_DATE - INTERVAL '1 day', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

*/

-- type date is DATE
-- HINT:  You will need to rewrite or cast the expression. because column "completed_on" is of type date[] but expression is of type date

/*
INSERT INTO habit_logs (habit_id, user_id, date, completed, completed_on, created_at, updated_at) VALUES
(5, '8d3dc861-b08e-4c12-98d3-02ae483e641f', CURRENT_DATE , TRUE, ARRAY[CURRENT_DATE - INTERVAL '1 day']::DATE[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

*/



-- calendarData[dateKey].nutritionLogs.push({
--   id: log.id,
--   foodId: log.food_id,
--   quantity: log.quantity,
--   createdAt: log.created_at,   


--- create