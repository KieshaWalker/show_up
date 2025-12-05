import { useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/GlassCard";
import { GradientScreen } from "@/components/GradientScreen";
import { SignedInStatus } from "@/components/SignedInStatus";
import { PriorityColors } from "@/constants/theme";
import { createHabit, deleteHabit, getHabits, getHabitLogs, toggleHabit, updateHabit } from "@/services/api";
import { weeklyTarget } from "@/utils/habits";

type HabitItem = {
  id: number;
  title: string;
  frequency: string;
  color?: string;
  weeklyTarget: number;
  completedToday: boolean;
};

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "every-other-day", label: "Every other day" },
  { value: "twice-a-week", label: "Twice a week" },
  { value: "three-times-a-week", label: "Three times a week" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function HabitsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [todayStr, setTodayStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({ title: "", frequency: "daily", color: PriorityColors.calm, editingId: null as number | null });

  const load = async () => {
    setRefreshing(true);
    try {
      const [{ habits: habitList }, logs] = await Promise.all([
        getHabits(),
        getHabitLogs({ date: todayStr }),
      ]);
      const completed = new Set((logs.habitLogs || []).filter((l: any) => l.completed).map((l: any) => l.habit_id));
      setHabits(
        (habitList || []).map((h: any) => ({
          ...h,
          weeklyTarget: weeklyTarget(h.frequency),
          completedToday: completed.has(h.id),
        }))
      );
    } catch (e) {
      console.error("habits load", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (habit: HabitItem) => {
    try {
      await toggleHabit({ habitId: habit.id, date: todayStr, completed: !habit.completedToday });
      setHabits((prev) =>
        prev.map((h) => (h.id === habit.id ? { ...h, completedToday: !h.completedToday } : h))
      );
    } catch (e) {
      Alert.alert("Error", "Failed to toggle habit");
    }
  };

  const save = async () => {
    if (!form.title.trim()) return;
    try {
      if (form.editingId) {
        await updateHabit({ id: form.editingId, title: form.title.trim(), frequency: form.frequency, color: form.color });
      } else {
        await createHabit({ title: form.title.trim(), frequency: form.frequency, color: form.color });
      }
      setForm({ title: "", frequency: "daily", color: PriorityColors.calm, editingId: null });
      load();
    } catch (e) {
      Alert.alert("Error", "Failed to save habit");
    }
  };

  const remove = (id: number) => {
    Alert.alert("Delete habit?", "This cannot be undone", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteHabit(id);
          setHabits((prev) => prev.filter((h) => h.id !== id));
        },
      },
    ]);
  };

  const completedToday = useMemo(() => habits.filter((h) => h.completedToday).length, [habits]);

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        <ThemedText type="title">Habits</ThemedText>
        <ThemedText>
          Tap to toggle today. Priority colors mirror the web app.
        </ThemedText>

        <GlassCard>
          <ThemedText type="subtitle">Today</ThemedText>
          <ThemedText>{completedToday} completed today</ThemedText>
        </GlassCard>

        <GlassCard>
          <ThemedText type="subtitle">Add / Edit</ThemedText>
          <TextInput
            placeholder="Habit name"
            value={form.title}
            onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
            style={styles.input}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {frequencies.map((f) => (
              <ThemedText
                key={f.value}
                onPress={() => setForm((prev) => ({ ...prev, frequency: f.value }))}
                style={[
                  styles.chip,
                  form.frequency === f.value && styles.chipActive,
                ]}
              >
                {f.label}
              </ThemedText>
            ))}
          </ScrollView>
          <View style={styles.colorRow}>
            {Object.entries(PriorityColors).map(([label, color]) => (
              <ThemedText
                key={label}
                onPress={() => setForm((prev) => ({ ...prev, color }))}
                style={[
                  styles.colorChip,
                  form.color === color && styles.colorChipActive,
                  { borderColor: color },
                ]}
              >
                {label}
              </ThemedText>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <ThemedText style={styles.saveBtn} onPress={save}>
              {form.editingId ? "Update" : "Add"}
            </ThemedText>
            {form.editingId && (
              <ThemedText
                style={[styles.saveBtn, { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.2)" }]}
                onPress={() => setForm({ title: "", frequency: "daily", color: PriorityColors.calm, editingId: null })}
              >
                Cancel
              </ThemedText>
            )}
          </View>
        </GlassCard>

        <GlassCard>
          <ThemedText type="subtitle">Your habits</ThemedText>
          {habits.map((h) => (
            <View key={h.id} style={styles.habitRow}>
              <View style={[styles.swatch, { backgroundColor: h.color || PriorityColors.calm }]} />
              <View style={{ flex: 1 }}>
                <ThemedText onPress={() => toggle(h)}>{h.title}</ThemedText>
                <ThemedText style={styles.meta}>
                  Target {h.weeklyTarget} • Today {h.completedToday ? "done" : "pending"}
                </ThemedText>
              </View>
              <ThemedText onPress={() => setForm({ title: h.title, frequency: h.frequency, color: h.color || PriorityColors.calm, editingId: h.id })} style={styles.link}>
                Edit
              </ThemedText>
              <ThemedText onPress={() => remove(h.id)} style={styles.link}>
                Delete
              </ThemedText>
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
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 12,
    color: "white",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.6)",
  },
  colorChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    textTransform: "capitalize",
  },
  colorChipActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  link: {
    textDecorationLine: "underline",
  },
});
