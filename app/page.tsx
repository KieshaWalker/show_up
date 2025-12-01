import Image from "next/image";
import Link from "next/link";
import { checkDbConnection } from "./db";
import Handler from "./handler/[...stack]/page";
import userPage from "./handler/[...stack]/user";
import { StackServerApp } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import HabitsPreview from "./components/HabitsPreview";
import NutritionPreview from "./components/NutritionPreview";
import CalendarPreview from "./components/CalendarPreview";


export default async function Home() {
  const result = await checkDbConnection();
  const user = await stackServerApp.getUser();

  if (!user) {
    return (
      <div className="hero-section">
        <div className="hero-content fade-in-up">
          <h1 className="hero-title">ShowUp</h1>
          <p className="hero-subtitle">
            Build better habits. Transform your life.
          </p>
          <a href="/handler/sign-in" className="hero-cta">
            Start Building Habits
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="content-container">
        <div className="user-profile fade-in-up">
          {await userPage()}
        </div>

        <h1 className="page-title fade-in-up">Your Journey Starts Here</h1>

        <div className="fade-in-up">
          <HabitsPreview />
          <NutritionPreview />
          <CalendarPreview />
        </div>
      </div>
    </div>
  );
}
