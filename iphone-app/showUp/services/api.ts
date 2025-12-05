// Shared API client for the Expo app to talk to the Next.js backend
// Keep payloads aligned with the web app's /api routes.
import * as SecureStore from "expo-secure-store";

export type Habit = {
  id: number;
  title: string;
  frequency: string;
  color?: string;
  created_at?: string;
};

export type HabitLog = {
  id: number;
  habit_id: number;
  date: string;
  completed: boolean;
  title?: string;
};

export type Food = {
  id: number;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  total_fat: number;
  saturated_fat: number;
  trans_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrate: number;
  dietary_fiber: number;
  total_sugars: number;
  added_sugars: number;
  vitamin_d: number;
  calcium: number;
  iron: number;
  potassium: number;
  created_at?: string;
};

export type NutritionLog = {
  id: number;
  food_id: number;
  date: string;
  quantity: number;
  name?: string;
  calories?: number;
};

export type CalendarDay = {
  date: string;
  habits: { id: number; title: string; completed: boolean }[];
  nutrition: { id: number; name: string; calories: number; quantity: number }[];
};

export type CalendarData = Record<string, CalendarDay>;

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const TOKEN_KEY = "stack_auth_token";
let authToken: string | null = null;

export async function setAuthToken(token: string) {
  authToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuthToken() {
  authToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function loadAuthToken(): Promise<string | null> {
  if (authToken) return authToken;
  authToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return authToken;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await loadAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": init.body instanceof FormData ? undefined : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }

  // Some routes may 204; guard json parse
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("json")) return undefined as T;

  return (await res.json()) as T;
}

// Habits
export const getHabits = () => apiFetch<{ habits: Habit[] }>("/api/habits");

export const createHabit = (payload: { title: string; frequency: string; color?: string }) =>
  apiFetch("/api/habits", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteHabit = (id: number) => apiFetch(`/api/habits?id=${id}`, { method: "DELETE" });

export const updateHabit = (payload: { id: number; title: string; frequency: string; color?: string }) => {
  const form = new FormData();
  form.append("id", String(payload.id));
  form.append("title", payload.title);
  form.append("frequency", payload.frequency);
  if (payload.color) form.append("color", payload.color);

  return apiFetch("/api/habits", {
    method: "PUT",
    body: form,
  });
};

// Habit logs
export const getHabitLogs = (params?: { habitId?: number; date?: string }) => {
  const search = new URLSearchParams();
  if (params?.habitId) search.set("habitId", String(params.habitId));
  if (params?.date) search.set("date", params.date);
  const qs = search.toString();
  return apiFetch<{ habitLogs: HabitLog[] }>(`/api/habits/log${qs ? `?${qs}` : ""}`);
};

export const logHabit = (payload: { habitId: number; date: string; completed: boolean }) =>
  apiFetch("/api/habits/log", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const toggleHabit = (payload: { habitId: number; date: string; completed: boolean }) =>
  apiFetch("/api/habits/log", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// Dashboard + nutrition (types left open for now; web responses are forwarded)
export const getDashboard = () => apiFetch<any>("/api/dashboard");

// Calendar
export const getCalendarMonth = (params?: { year?: number; month?: number }) => {
  const search = new URLSearchParams();
  if (params?.year) search.set("year", String(params.year));
  if (params?.month) search.set("month", String(params.month));
  const qs = search.toString();
  return apiFetch<{ calendarData: CalendarData }>(`/api/calendar${qs ? `?${qs}` : ""}`);
};

export const getCalendarDashboard = () => apiFetch<any>("/api/calendar/dashboard");
export const getCalendarPantry = () => apiFetch<any>("/api/calendar/pantry");
export const getCalendarToday = () => apiFetch<any>("/api/calendar/today");
export const getCalendarWeek = () => apiFetch<any>("/api/calendar/week");
export const getCalendarYesterday = () => apiFetch<any>("/api/calendar/yesterday");

// Nutrition
export const getNutritionLogs = () => apiFetch<{ nutritionLogs: NutritionLog[] }>("/api/nutrition/log");

export const addNutritionLog = (payload: { foodId: number; date: string; quantity: number }) =>
  apiFetch("/api/nutrition/log", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getNutrition = () => apiFetch<any>("/api/nutrition");
export const getPantry = () => apiFetch<any>("/api/calendar/pantry");

// Food
export const getFood = () => apiFetch<{ food: Food[] }>("/api/food");

export const createFood = (payload: Partial<Food> & { name: string }) =>
  apiFetch("/api/food", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Helper to configure base URL if needed
export const getApiBase = () => API_BASE;
