import { ScrollView, StyleSheet } from "react-native";
import { GradientScreen } from "@/components/GradientScreen";
import { GlassCard } from "@/components/GlassCard";
import { ThemedText } from "@/components/themed-text";
import { SignedInStatus } from "@/components/SignedInStatus";

export default function CalendarScreen() {
  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Calendar</ThemedText>
        <ThemedText>Coming soon: monthly view with habit and nutrition markers.</ThemedText>

        <GlassCard style={{ marginTop: 16 }}>
          <ThemedText type="subtitle">Planned</ThemedText>
          <ThemedText>- Month grid with activity dots</ThemedText>
          <ThemedText>- Tap day for details</ThemedText>
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
});
