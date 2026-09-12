require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'sahakar_spatial_db',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD
});

const seedPostgres = async () => {
    try {
        console.log('Connecting to PostgreSQL...');

        const query = `
      INSERT INTO worker_locations (worker_id, worker_name, trade_skill, is_online, is_busy, rating, fairness_score, location)
      VALUES
      ('w_1', 'Ramesh Patil', 'electrical', true, false, 4.9, 98.5, ST_SetSRID(ST_MakePoint(72.8360, 19.0596), 4326)),
      ('w_2', 'Sunita Shinde', 'cleaning', true, false, 4.8, 96.0, ST_SetSRID(ST_MakePoint(72.8420, 19.0680), 4326)),
      ('w_3', 'Ganesh Kadam', 'plumbing', true, false, 4.9, 99.2, ST_SetSRID(ST_MakePoint(72.8390, 19.0820), 4326)),
      ('w_4', 'Abdul Shaikh', 'carpentry', true, false, 4.7, 94.0, ST_SetSRID(ST_MakePoint(72.8777, 19.0650), 4326)),
      ('w_5', 'Vikas More', 'painting', true, false, 4.8, 95.5, ST_SetSRID(ST_MakePoint(72.8250, 19.0520), 4326))
      ON CONFLICT (worker_id) DO UPDATE 
      SET location = EXCLUDED.location, last_ping = CURRENT_TIMESTAMP;
    `;

        await pool.query(query);
        console.log('✔ Workers seeded into PostgreSQL successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await pool.end();
    }
};

seedPostgres();