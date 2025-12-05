import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { ThemedView } from "./themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export function GlassCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];
  return (
    <ThemedView
      style={[
        {
          backgroundColor: palette.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
}
