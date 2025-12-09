"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
type HabitBubble = {
  id: number;
  title: string;
  color?: string;
  frequency: string;
  weeklyTarget: number;
  weeklyCompleted: number;
  remainingThisWeek: number;
  completedToday: boolean;
};

export default function HabitsBubbles({ today, startOfWeek, endOfWeek, habits, displayName }: { today: string; startOfWeek: string; endOfWeek: string; habits: HabitBubble[]; displayName?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<HabitBubble[]>(habits);
  const [savingId, setSavingId] = useState<number | null>(null);

  const totalTarget = items.reduce((sum, h) => sum + h.weeklyTarget, 0);
  const totalCompleted = items.reduce((sum, h) => sum + h.weeklyCompleted, 0);
  const progress = totalTarget > 0 ? Math.min((totalCompleted / totalTarget) * 100, 100) : 0;
  const visibleItems = items.filter((h) => !h.completedToday);

  const toggleToday = async (habit: HabitBubble) => {
    if (savingId !== null) return; // avoid double-clicks
    setSavingId(habit.id);
    try {
      const nextCompleted = !habit.completedToday;
      const res = await fetch("/api/habits/log", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id, date: today, completed: nextCompleted }),
      });
      if (!res.ok) {
        console.error("Failed to toggle habit", await res.text());
        return;
      }
      setItems((prev) =>
        prev.map((h) => {
          if (h.id !== habit.id) return h;
          const delta = nextCompleted ? -1 : 1;
          const nextRemaining = Math.max(Math.min(h.remainingThisWeek + delta, h.weeklyTarget), 0);
          const nextCompletedCount = h.weeklyCompleted + (nextCompleted ? 1 : -1);
          return {
            ...h,
            completedToday: nextCompleted,
            remainingThisWeek: nextRemaining,
            weeklyCompleted: Math.max(nextCompletedCount, 0),
          };
        })
      );
      router.refresh(); // ensure server data (weekly counts, today state) is persisted beyond session
    } finally {
      setSavingId(null);
    }
  };

  return (
        <div className="glass-card calendar-preview">

          <h2 className="b-title" style={{ marginTop: 16 }}>{displayName || "you"}</h2>
          <p className="z">Week {startOfWeek} → {endOfWeek}</p>
        <p className="z">Consistency beats intensity</p>
      <div className="bubble-progress-bar ">
        <div className="flex items-center justify-between text-sm text-gray-200">
          <span>Total target: <strong className="text-white">{totalTarget}</strong></span>
          <span>Completed: <strong className="text-white">{totalCompleted}</strong></span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7cf4ff, #8f8bff)" }}
            aria-label="weekly progress"
          />
        </div>
        <div className="text-right text-xs text-gray-300">{progress.toFixed(0)}% of weekly possible habits</div>
      </div>
      <div className="calendar-stats">
        {visibleItems.length === 0 && (
          <p className="text-sm text-gray-300">All habits done for today. They will return when a new day starts or when weekly slots remain.</p>
        )}
        {visibleItems.map((habit) => {
          const isActive = habit.completedToday;
          const bubbleColor = habit.color || "#7cf4ff";
          return (
            <button
              key={habit.id}
              onClick={() => toggleToday(habit)}
              disabled={savingId === habit.id}
              className="reactive"
              style={{
                background: isActive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)",
                boxShadow: isActive ? "none" : `0 10px 30px ${bubbleColor}22`,
                opacity: isActive ? 0.55 : 1,
              }}
              aria-pressed={isActive}
            >
              <div className="stat">
                <span
                  className="inline-flex h-auto w-auto items-center justify-center rounded-full text-sm font-semibold"
                  style={{ background: isActive ? "#4b5563" : bubbleColor, color: isActive ? "#e5e7eb" : "#05060a" }}
                >

                  {habit.title.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-xs tracking-wide text-white">({habit.frequency.replace(/-/g, " ")})</p>
                  <p className="w-auto h-auto text-base font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>{habit.title}</p>
                </div>
              </div>
              <div className="grid gap-1 text-xs text-gray-300">
                <span>Target: <strong className="text-gray-300">{habit.weeklyTarget}</strong></span>
                <span>Done: <strong className="text-gray-300">{habit.weeklyCompleted}</strong></span>
                <span>Remaining: <strong className="text-gray-300">{habit.remainingThisWeek}</strong></span>
              </div>
              {isActive && <p className="text-xs text-emerald-400">Marked done for today</p>}
            </button>
          );
        })}
        </div>
    
 
    </div>
  );
}
