/**
 * Font Configuration
 *
 * Configures Google Fonts for the ShowUp application.
 * Uses Inter font family which provides excellent readability and modern aesthetics.
 */

import { Inter } from "next/font/google";

/**
 * Inter Font Configuration
 *
 * Loads the Inter font family from Google Fonts with optimized settings:
 * - Weights: Regular (400), Medium (500), and Semi-bold (600) for typography hierarchy
 * - Subsets: Latin characters for Western languages
 * - Display: Swap for better performance (shows fallback font initially, then swaps to Inter)
 * - Variable: CSS custom property for easy usage throughout the app
 *
 * The font is loaded with Next.js font optimization for better performance and privacy.
 */
export const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
