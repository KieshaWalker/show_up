import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { GradientScreen } from "@/components/GradientScreen";
import { GlassCard } from "@/components/GlassCard";
import { ThemedText } from "@/components/themed-text";
import { SignedInStatus } from "@/components/SignedInStatus";
import { getDashboard, getHabits, getHabitLogs } from "@/services/api";
import { weeklyTarget } from "@/utils/habits";
import { PriorityColors } from "@/constants/theme";

type HabitCard = {
  id: number;
  title: string;
  frequency: string;
  color?: string;
  weeklyTarget: number;
  completedToday: boolean;
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [habits, setHabits] = useState<HabitCard[]>([]);
  const [todayHabits, setTodayHabits] = useState<any[]>([]);

  const load = async () => {
    setRefreshing(true);
    try {
      const [{ habits: habitList }, dashboard] = await Promise.all([
        getHabits(),
        getDashboard(),
      ]);
      const todayLogsRes = await getHabitLogs({ date: dashboard.todayStr });
      const completedIds = new Set(
        (todayLogsRes.habitLogs || []).filter((l: any) => l.completed).map((l: any) => l.habit_id)
      );
      setTodayHabits(dashboard.todayHabits || []);
      setHabits(
        (habitList || []).map((h: any) => ({
          ...h,
          weeklyTarget: weeklyTarget(h.frequency),
          completedToday: completedIds.has(h.id),
        }))
      );
    } catch (err) {
      console.error("home load error", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const weeklyTotals = useMemo(() => {
    const totalTarget = habits.reduce((s, h) => s + h.weeklyTarget, 0);
    const totalDone = habits.reduce((s, h) => s + (h.completedToday ? 1 : 0), 0);
    const progress = totalTarget > 0 ? Math.min((totalDone / totalTarget) * 100, 100) : 0;
    return { totalTarget, totalDone, progress };
  }, [habits]);

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText>Welcome back. Here is your week.</ThemedText>

        <GlassCard>
          <ThemedText type="subtitle">This week</ThemedText>
          <ThemedText>
            {weeklyTotals.totalDone}/{weeklyTotals.totalTarget} possible habits
          </ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${weeklyTotals.progress}%`, backgroundColor: PriorityColors.calm },
              ]}
            />
          </View>
          <ThemedText>{weeklyTotals.progress.toFixed(0)}% complete</ThemedText>
        </GlassCard>

        <GlassCard>
          <ThemedText type="subtitle">Today</ThemedText>
          <ThemedText>Completed today: {todayHabits.length}</ThemedText>
        </GlassCard>

        <GlassCard>
          <ThemedText type="subtitle">This week’s bubbles</ThemedText>
          {habits.map((h) => (
            <View key={h.id} style={styles.habitRow}>
              <View style={[styles.colorDot, { backgroundColor: h.color || PriorityColors.calm }]} />
              <View style={{ flex: 1 }}>
                <ThemedText>{h.title}</ThemedText>
                <ThemedText style={styles.meta}>
                  Target {h.weeklyTarget} • Done {h.completedToday ? 1 : 0}
                </ThemedText>
              </View>
              {h.completedToday && <ThemedText type="subtitle">✓</ThemedText>}
            </View>
          ))}
          {habits.length === 0 && <ThemedText>No habits yet.</ThemedText>}
        </GlassCard>

        <SignedInStatus />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  progressBar: {
    height: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    marginVertical: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
});
