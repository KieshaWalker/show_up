import AIagent from "./handler";

export default async function NutritionPage() {
    const agent = AIagent();




  return (
    <div className="margin-8 p-6 glass-card nutrition-card">
        <h1 className="nutrition-title">Nutrition Information</h1>
    
        <p className="nutrition-description">
          Welcome to the Nutrition section! Here you can find tips and resources to help you maintain a balanced diet and support your habit-building journey.
        </p>
        <div className="nutrition-tips">
          <h2 className="tips-title">Healthy Eating Tips:</h2>
          <ul className="tips-list">
            <li>Incorporate a variety of fruits and vegetables into your meals.</li>
            <li>Choose whole grains over refined grains for added fiber.</li>
            <li>Stay hydrated by drinking plenty of water throughout the day.</li>
            <li>Limit processed foods and sugary snacks.</li>
            <li>Plan your meals ahead to avoid unhealthy choices.</li>
          </ul>
        </div>


        
    </div>
  );
}