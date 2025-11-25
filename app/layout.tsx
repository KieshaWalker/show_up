import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import { inter } from "./fonts";
import Navbar from "./pages/navbar";

export const metadata: Metadata = {
  title: "ShowUp - Habit Tracker",
  description: "Build better habits. Transform your life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Navbar />
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
