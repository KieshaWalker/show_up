import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import { inter } from "./fonts";

export const metadata: Metadata = {
  title: "ShowUp - Habit Tracker",
  description: "A habit tracking app powered by intention and drive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body><StackProvider app={stackClientApp}><StackTheme>{children}</StackTheme></StackProvider></body>
    </html>
  );
}
