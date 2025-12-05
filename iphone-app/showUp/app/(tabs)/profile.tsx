import { ScrollView, StyleSheet } from "react-native";
import { GradientScreen } from "@/components/GradientScreen";
import { GlassCard } from "@/components/GlassCard";
import { ThemedText } from "@/components/themed-text";
import { SignedInStatus } from "@/components/SignedInStatus";
import { ThemedView } from "@/components/themed-view";
import { useAuthToken } from "@/services/auth";

export default function ProfileScreen() {
  const { token, clear } = useAuthToken();
  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Profile</ThemedText>
        <GlassCard>
          <ThemedText type="subtitle">Session</ThemedText>
          <SignedInStatus />
          <ThemedView style={{ marginTop: 12 }}>
            <ThemedText>Token stored: {token ? 'yes' : 'no'}</ThemedText>
          </ThemedView>
        </GlassCard>
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
