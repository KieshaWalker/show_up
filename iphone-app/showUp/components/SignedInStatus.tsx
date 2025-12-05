import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Pressable, StyleSheet } from "react-native";
import { useAuthToken } from "@/services/auth";

export function SignedInStatus() {
  const { token, clear } = useAuthToken();
  if (!token) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Signed in</ThemedText>
      <ThemedText numberOfLines={1} style={styles.token}>Token: {token.slice(0, 12)}…</ThemedText>
      <Pressable onPress={clear} style={styles.signOut}>
        <ThemedText type="link">Sign out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  token: {
    fontSize: 12,
    opacity: 0.8,
  },
  signOut: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
});
