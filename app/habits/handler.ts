import { checkDbConnection } from "../db";

export async function handleHabitRequest() {
  const dbStatus = await checkDbConnection();
  
  return {
    status: 200,
    body: {
      message: "Habit handler is working!",
      dbStatus
    }
  };
}