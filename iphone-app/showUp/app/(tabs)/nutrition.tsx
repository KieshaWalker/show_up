import { useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { GradientScreen } from "@/components/GradientScreen";
import { GlassCard } from "@/components/GlassCard";
import { ThemedText } from "@/components/themed-text";
import { SignedInStatus } from "@/components/SignedInStatus";
import { addNutritionLog, Food, getFood, getNutritionLogs, NutritionLog } from "@/services/api";

export default function NutritionScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [food, setFood] = useState<Food[]>([]);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const foodMap = useMemo(() => {
    const map: Record<number, Food> = {};
    food.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [food]);

  const filteredFood = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return food;
    return food.filter((f) => f.name.toLowerCase().includes(term));
  }, [food, search]);

  const logsWithMacros = useMemo(() => {
    return logs.map((l) => {
      const f = foodMap[l.food_id];
      const calories = ((f?.calories ?? l.calories ?? 0) * l.quantity) || 0;
      const protein = (f?.protein ?? 0) * l.quantity;
      const carbs = (f?.total_carbohydrate ?? 0) * l.quantity;
      const fat = (f?.total_fat ?? 0) * l.quantity;
      return { ...l, calories, protein, carbs, fat };
    });
  }, [logs, foodMap]);

  const totalsByDate = useMemo(() => {
    const totals: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    logsWithMacros.forEach((l) => {
      if (!totals[l.date]) totals[l.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      totals[l.date].calories += l.calories;
      totals[l.date].protein += l.protein;
      totals[l.date].carbs += l.carbs;
      totals[l.date].fat += l.fat;
    });
    return totals;
  }, [logsWithMacros]);

  const primaryTotalsDate = useMemo(() => {
    if (totalsByDate[today]) return today;
    const dates = Object.keys(totalsByDate).sort((a, b) => (a > b ? -1 : 1));
    return dates[0];
  }, [totalsByDate, today]);

  const load = async () => {
    setRefreshing(true);
    try {
      const [{ food }, logsRes] = await Promise.all([getFood(), getNutritionLogs()]);
      setFood(food || []);
      setLogs(logsRes.nutritionLogs || []);
    } catch (e) {
      console.error("nutrition load", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addLog = async () => {
    if (!selectedFood) {
      Alert.alert("Select a food", "Pick an item from your pantry before logging.");
      return;
    }
    const qtyNumber = Number(quantity) || 0;
    if (qtyNumber <= 0) {
      Alert.alert("Quantity needed", "Enter a quantity greater than zero.");
      return;
    }
    try {
      await addNutritionLog({ foodId: selectedFood, date: today, quantity: qtyNumber });
      setQuantity("1");
      load();
    } catch (e) {
      console.error("add log", e);
    }
  };

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        <ThemedText type="title">Nutrition</ThemedText>

        <GlassCard>
          <ThemedText type="subtitle">Quick log</ThemedText>
          <TextInput
            placeholder="Search pantry"
            value={search}
            onChangeText={setSearch}
            style={[styles.input, { marginTop: 8 }]}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {filteredFood.map((f) => (
              <ThemedText
                key={f.id}
                onPress={() => setSelectedFood(f.id)}
                style={[
                  styles.chip,
                  selectedFood === f.id && styles.chipActive,
                ]}
              >
                {f.name}
              </ThemedText>
            ))}
            {filteredFood.length === 0 && <ThemedText style={{ opacity: 0.7 }}>No matches</ThemedText>}
          </ScrollView>
          <TextInput
            placeholder="Quantity"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            style={styles.input}
          />
          <ThemedText
            style={[styles.saveBtn, !selectedFood && styles.saveBtnDisabled]}
            onPress={addLog}
          >
            Add log
          </ThemedText>
        </GlassCard>

        {primaryTotalsDate && (
          <GlassCard>
            <ThemedText type="subtitle">
              Daily totals {primaryTotalsDate === today ? "(today)" : `(${primaryTotalsDate})`}
            </ThemedText>
            <View style={styles.rowBetween}>
              <ThemedText>Calories</ThemedText>
              <ThemedText>{Math.round(totalsByDate[primaryTotalsDate].calories)} kcal</ThemedText>
            </View>
            <View style={styles.rowBetween}>
              <ThemedText>Protein</ThemedText>
              <ThemedText>{totalsByDate[primaryTotalsDate].protein.toFixed(1)} g</ThemedText>
            </View>
            <View style={styles.rowBetween}>
              <ThemedText>Carbs</ThemedText>
              <ThemedText>{totalsByDate[primaryTotalsDate].carbs.toFixed(1)} g</ThemedText>
            </View>
            <View style={styles.rowBetween}>
              <ThemedText>Fat</ThemedText>
              <ThemedText>{totalsByDate[primaryTotalsDate].fat.toFixed(1)} g</ThemedText>
            </View>
          </GlassCard>
        )}

        <GlassCard>
          <ThemedText type="subtitle">Recent entries</ThemedText>
          {logsWithMacros.slice(0, 10).map((l) => (
            <View key={l.id} style={styles.row}>
              <ThemedText>{l.name || foodMap[l.food_id]?.name || `Food ${l.food_id}`}</ThemedText>
              <ThemedText style={styles.meta}>{l.date} • qty {l.quantity}</ThemedText>
              <ThemedText style={styles.meta}>
                {Math.round(l.calories)} kcal • {l.protein.toFixed(1)}P / {l.carbs.toFixed(1)}C / {l.fat.toFixed(1)}F
              </ThemedText>
            </View>
          ))}
          {logs.length === 0 && <ThemedText>No logs yet.</ThemedText>}
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.6)",
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
  saveBtn: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  row: {
    paddingVertical: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
});
