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
  quantity INTEGER NOT NULL,
  meal_type VARCHAR(50) DEFAULT 'unspecified',
  calories INTEGER NOT NULL,
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



/*

SELECT * FROM nutrition_logs WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f';

*/
--SELECT * FROM nutrition_logs WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f';


---- nutrtion_logs's label 
 ----- id | food_id |               user_id                |    date    | quantity | meal_type | calories |         created_at         |         updated_at         | count 


--SELECT * FROM food WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f';
--  id |               user_id                | name  | serving_size | calories | protein | total_fat | saturated_fat | trans_fat | cholesterol | sodium | total_carbohydrate | dietary_fiber | total_sugars | added_sugars | vitamin_d | calcium | iron | potassium |        created_at         | count 


--SELECT * FROM habits WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f';
 --id |               user_id                |      title      |    frequency    |  color  |    icon    | is_active |         created_at         | count | custom 

--SELECT * FROM habit_logs WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f';
 --- id | habit_id |               user_id                |    date    | completed | completed_on |         created_at         |         updated_at         | count 

/*
 -- insert nutrtion log entry for user id '8d3dc861-b08e-4c12-98d3-02ae483e641f' for food id 1 for yesterday with quantity 2 and calories 500
 INSERT INTO nutrition_logs (food_id, user_id, date, quantity, meal_type, calories, created_at, updated_at) VALUES
 (1, '8d3dc861-b08e-4c12-98d3-02ae483e641f', CURRENT_DATE - INTERVAL '1 day', 2, CURRENT_TIMESTAMP, 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
*/

 -- select from yesterdays nutrtion logs for user id '8d3dc861-b08e-4c12-98d3-02ae483e641f'
  SELECT * FROM nutrition_logs WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f' AND date = CURRENT_DATE - INTERVAL '1 day';

  -- select from todays nutrtion logs for user id '8d3dc861-b08e-4c12-98d3-02ae483e641f'
    SELECT * FROM nutrition_logs WHERE user_id = '8d3dc861-b08e-4c12-98d3-02ae483e641f' AND date = CURRENT_DATE;




    --- inserting food from traderjoes for all users to be able to select from

/*
Sweet Ripe Plantains
Nutrition Facts
Serves about 6
serving size
3 pieces(78g)
calories per serving
130
Amount	%DV
Total Fat	2.0 g	3%
Saturated Fat	0 g	0%
Trans Fat	0 g	
Cholesterol	0 mg	0%
Sodium	0 mg	0%
Total Carbohydrate	28 g	10%
Dietary Fiber	2 g	7%
Total Sugars	18 g	
Includes	0 g Added Sugars	0%
Protein	1 g	
Vitamin D	0.0 mcg	0%
Calcium	0 mg	0%
Iron	0.0 mg	0%
Potassium	370 mg	8%


Mandarin Orange Chicken
Nutrition Facts
Serves about 4
serving size
1 cup frozen chicken and sauce(163g))
calories per serving
320
Amount	%DV
Total Fat	10g	13%
Saturated Fat	2g	10%
Trans Fat	0g	
Cholesterol	95mg	32%
Sodium	570mg	25%
Total Carbohydrate	35g	13%
Dietary Fiber	1g	4%
Total Sugars	16g	
Includes	16g Added Sugars	32%
Protein	22g	
Vitamin D	0.1mcg	0%
Calcium	10mg	0%
Iron	2mg	10%
Potassium	370mg	8%


Organic Low Sodium Vegetable Broth
Nutrition Facts
Serves About 4
serving size
1 cup(240mL)
calories per serving
20
Amount	%DV
Total Fat	0 g	0%
Saturated Fat	0 g	0%
Trans Fat	0 g	
Cholesterol	0 mg	0%
Sodium	40 mg	2%
Total Carbohydrate	5 g	2%
Dietary Fiber	0 g	0%
Total Sugars	3 g	
Includes	1 g Added Sugars	2%
Protein	less than 1 g	
Vitamin D	0.0 mcg	0%
Calcium	20 mg	2%
Iron	0.0 mg	0%
Potassium	70 mg	2%


Pineapple Teriyaki Chicken Meatballs
Nutrition Facts
Serves about 4
serving size
6 meatballs(85g)
calories per serving
160
Amount	%DV
Total Fat	9 g	12%
Saturated Fat	2.0 g	10%
Trans Fat	0 g	
Cholesterol	65 mg	22%
Sodium	440 mg	19%
Total Carbohydrate	8 g	3%
Dietary Fiber	0 g	0%
Total Sugars	5 g	
Includes	4 g Added Sugars	8%
Protein	13 g	
Vitamin D	0.1 mcg	0%
Calcium	10 mg	0%
Iron	1.0 mg	6%
Potassium	370 mg	8%

Greek Nonfat Yogurt Plain

Nutrition Facts
Serves about 5
serving size
3/4 Cup(170g)
calories per serving
110
Amount	%DV
Total Fat	0 g	0%
Saturated Fat	0 g	0%
Trans Fat	0 g	
Cholesterol	10 mg	3%
Sodium	75 mg	3%
Total Carbohydrate	7 g	3%
Dietary Fiber	0 g	0%
Total Sugars	5 g	
Includes	0 g Added Sugars	0%
Protein	17 g	34%
Vitamin D	0.0 mcg	0%
Calcium	190 mg	15%
Iron	0.0 mg	0%
Potassium	240 mg	6%

*/


SELECT * FROM food;

