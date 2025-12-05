import { useEffect, useState } from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { StyleSheet, TextInput, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuthToken } from "@/services/auth";

const STACK_AUTH_URL = process.env.EXPO_PUBLIC_STACK_AUTH_URL;

export default function SignInScreen() {
  const router = useRouter();
  const { token, save } = useAuthToken();
  const [manualToken, setManualToken] = useState("");
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (token) {
      router.replace("/(tabs)");
    }
  }, [token, router]);

  const openHostedLogin = async () => {
    if (!STACK_AUTH_URL) return;
    setLaunching(true);
    try {
      await WebBrowser.openBrowserAsync(STACK_AUTH_URL);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign in</ThemedText>
      <ThemedText>
        Use your Stack Auth sign-in. If the hosted flow returns a token, paste it below. Set
        EXPO_PUBLIC_STACK_AUTH_URL to your auth page.
      </ThemedText>

      <Pressable
        style={[styles.button, !STACK_AUTH_URL && styles.buttonDisabled]}
        disabled={!STACK_AUTH_URL || launching}
        onPress={openHostedLogin}
      >
        <ThemedText type="link">Open Stack Auth</ThemedText>
      </Pressable>

      <ThemedText style={{ marginTop: 16 }}>Or paste a token</ThemedText>
      <TextInput
        placeholder="Bearer token"
        value={manualToken}
        onChangeText={setManualToken}
        autoCapitalize="none"
        style={styles.input}
      />
      <Pressable
        style={[styles.button, !manualToken && styles.buttonDisabled]}
        disabled={!manualToken}
        onPress={async () => {
          await save(manualToken.trim());
          router.replace("/(tabs)");
        }}
      >
        <ThemedText type="link">Save token</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 12,
    color: "white",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  button: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
