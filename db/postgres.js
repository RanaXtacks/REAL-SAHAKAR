const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Configuration for PostgreSQL + PostGIS connection
const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'sahakar_spatial_db',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

let isPostgisConnected = false;

// Test connection on startup gracefully
pool.query('SELECT PostGIS_Full_Version()')
    .then(res => {
        isPostgisConnected = true;
        console.log('✅ PostgreSQL + PostGIS Connected Successfully!');
    })
    .catch(err => {
        isPostgisConnected = false;
        console.log('ℹ️ PostgreSQL / PostGIS not yet running locally. (Run through POSTGRES_POSTGIS_SETUP_GUIDE.md to activate). Fallback to MongoDB geospatial active.');
    });

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
    isReady: () => isPostgisConnected
};
