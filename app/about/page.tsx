
import userPage from "../handler/[...stack]/user";

export default async function AboutPage() {
    const userContent = await userPage();
  return (
    <main className="about-page">
          <div className="user-profile fade-in-up">
          {userContent}
        </div>
      <h1>About ShowUp</h1>
      <p>
        ShowUp is dedicated to helping you build better habits and transform your life. Our mission is to provide you with the tools and support you need to stay consistent and motivated on your journey to self-improvement.
      </p>
      <h2>Our Features</h2>
      <ul>
        <li>Habit Tracking: Monitor your daily habits and see your progress over time.</li>
        <li>Nutrition Logging: Keep track of your meals and nutritional intake.</li>
        <li>Calendar Integration: Visualize your habit streaks and important dates.</li>
      </ul>
      <h2>Contact Us</h2>
      <p>
        If you have any questions or feedback, feel free to reach out to us at <a href="mailto:support@showup.com">support@showup.com</a>.
      </p>
    </main>
  );
}