import { ReactNode, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthToken } from "@/services/auth";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ActivityIndicator } from "react-native";

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, loading } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/sign-in");
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 }}>
        <ActivityIndicator />
        <ThemedText>Checking session…</ThemedText>
      </ThemedView>
    );
  }

  return <>{children}</>;
}
