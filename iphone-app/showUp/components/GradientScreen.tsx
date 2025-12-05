import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function GradientScreen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];
  const gradient = Array.isArray(palette.gradient) ? palette.gradient : [palette.background, palette.background];
  return (
    <LinearGradient colors={gradient} style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
