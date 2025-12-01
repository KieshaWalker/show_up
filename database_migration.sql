-- Create the food table for nutrition tracking
-- Run this in your Neon SQL editor or psql

-- If table exists with wrong name, you can rename it:
-- ALTER TABLE food_items RENAME TO food;

-- Or drop and recreate (WARNING: This will delete existing data)

DROP TABLE IF EXISTS habits;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the habits table for habit tracking
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,  -- TEXT type to accept UUID strings from Stack Auth
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);




INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'testuser@example.com', 'hashedpassword');