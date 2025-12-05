/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Web palette carry-over
export const PriorityColors = {
  calm: '#7cf4ff',
  medium: '#facc15',
  high: '#f97316',
  critical: '#ef4444',
};

const tintColorLight = PriorityColors.calm;
const tintColorDark = '#ffffff';

const backgroundGradient = {
  light: ['#626554', '#794949', '#1324c4'],
  dark: ['#1c1c1e', '#232323', '#0b0b0b'],
};

export const Colors = {
  light: {
    text: '#1d1d1f',
    background: '#626554',
    gradient: backgroundGradient.light,
    surface: 'rgba(255,255,255,0.26)',
    surfaceSecondary: 'rgba(248,249,250,0.25)',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#a1a1aa',
    tabIconSelected: tintColorLight,
    border: 'rgba(255,255,255,0.12)',
  },
  dark: {
    text: '#ececee',
    background: '#1c1c1e',
    gradient: backgroundGradient.dark,
    surface: 'rgba(255,255,255,0.08)',
    surfaceSecondary: 'rgba(255,255,255,0.05)',
    tint: tintColorDark,
    icon: '#9ba1a6',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    border: 'rgba(255,255,255,0.12)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
