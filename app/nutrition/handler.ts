
// connect to postgressql database and fetch foods

import { Pool } from "pg";


function AIagent() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
        rejectUnauthorized: false
        }
    });
    
    async function getFoods() {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM foods');
            return res.rows;
        } finally {
            client.release();
        }
    }
}
export default AIagent;