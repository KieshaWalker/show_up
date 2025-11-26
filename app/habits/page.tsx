import { handleHabitRequest } from "./handler";



export default async function Habits() {
  // Example: Create a new habit (this would typically be done via a form submission)
  // const newHabit = await createHabit("userId123", "Exercise", "Daily morning exercise");

  return (
    <div className="habits-section">
      <div className="glass-card habit-card">
        <h2 className="habit-title">Your Habits</h2>
        <a href="/habits/add" className="glass-button">
          Add Habit
        </a>
        <p className="habit-description">
          Track habits. Create lasting change.
        </p>

        {/* Placeholder for habits list */}
        <div className="habits-grid">
          <div className="habit-card">
            <h3 className="habit-title">Morning Exercise</h3>
            <p className="habit-description">Start your day strong with movement</p>
            <div className="habit-stats">
              <span className="habit-streak">7 day streak</span>
            </div>
          </div>

          <div className="habit-card">
            <h3 className="habit-title">Read for 20 minutes</h3>
            <p className="habit-description">Grow your mind daily</p>
            <div className="habit-stats">
              <span className="habit-streak">12 day streak</span>
            </div>
          </div>

          <div className="habit-card">
            <h3 className="habit-title">Drink 8 glasses of water</h3>
            <p className="habit-description">Fuel your body with hydration</p>
            <div className="habit-stats">
              <span className="habit-streak">3 day streak</span>
            </div>
          </div>
        </div>

        {/* Debug info (remove in production) */}
        <details className="mt-4">
          <summary className="text-sm text-gray-400 cursor-pointer">Debug Info</summary>
          <pre className="text-xs mt-2 p-2 bg-black/20 rounded overflow-auto">
            {JSON.stringify(await handleHabitRequest(), null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}