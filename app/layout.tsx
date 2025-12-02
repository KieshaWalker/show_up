/**
 * Root Layout Component
 *
 * The main layout wrapper for the entire ShowUp application.
 * Sets up global providers, themes, navigation, and metadata.
 */

import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import { inter } from "./fonts";
import Navbar from "./pages/navbar";

/**
 * Application metadata for SEO and browser display
 */
export const metadata: Metadata = {
  title: "ShowUp - Habit Tracker",
  description: "Build better habits. Transform your life.",
};

/**
 * Root Layout Component
 *
 * Wraps the entire application with necessary providers and global components.
 * This layout is applied to all pages in the app.
 *
 * Features:
 * - Stack Auth provider for authentication
 * - Global theme and styling
 * - Navigation bar
 * - Font loading and dark mode setup
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Root layout structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>
        {/* Stack Auth Provider - Manages authentication state globally */}
        <StackProvider app={stackClientApp}>
          {/* Stack Theme Provider - Applies consistent theming */}
          <StackTheme>
            {/* Global Navigation Bar */}
            <Navbar />
            {/* Main application content */}
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
