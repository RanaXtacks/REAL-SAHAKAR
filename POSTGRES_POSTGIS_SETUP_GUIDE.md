# PostgreSQL + PostGIS Installation & Setup Guide for SahakarConnect

This guide provides complete, step-by-step instructions for installing **PostgreSQL** with the **PostGIS** spatial extension on Windows, setting up the spatial database, and connecting it to the SahakarConnect Node.js backend alongside MongoDB.

---

## 1. Why PostGIS for SahakarConnect?

SahakarConnect is a labour cooperative platform where:
- **Worker Proximity**: Customers need workers dispatched from within 2–5 km.
- **Fair Allocation**: Workers within a spatial polygon (e.g., Ward / Taluka) are selected in fair rotation.
- **Demand Hotspots**: Co-op administrators visualize heatmaps of where plumbers, electricians, or carpenters are needed most.
- **Spatial Precision**: PostGIS provides sub-meter geodesic accuracy (`geography(Point, 4326)`), R-Tree spatial indexing (GiST), and native functions like `ST_DWithin`, `ST_Distance`, and `ST_ClusterKMeans`.

MongoDB handles user auth, booking history, and dynamic documents, while **PostGIS handles ultra-fast geospatial indexing and spatial dispatch**.

---

## 2. Windows Installation (Step-by-Step)

### Step 2.1: Download PostgreSQL
1. Visit the official EnterpriseDB download page:
   [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. Select **PostgreSQL 16** (or 15) for **Windows x86-64**.
3. Run the downloaded installer (`postgresql-16.x-windows-x64.exe`).

### Step 2.2: Run the Installer
- **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\16`).
- **Components to Install**: Ensure all are checked:
  - PostgreSQL Server
  - pgAdmin 4
  - Stack Builder (⚠️ **CRITICAL — Needed for PostGIS**)
  - Command Line Tools
- **Data Directory**: Keep default (`C:\Program Files\PostgreSQL\16\data`).
- **Password**: Enter a secure password (e.g., `postgres` or `admin123`). **Remember this password!**
- **Port**: Default `5432`.
- **Locale**: Keep `[Default locale]`.
- Click **Next** until installation completes.

### Step 2.3: Install PostGIS via Stack Builder
At the end of the PostgreSQL installation, **check the box**:
> *"Launch Stack Builder at exit"* -> Click **Finish**.

If you closed it, open **Stack Builder** from the Windows Start Menu:
1. Select your PostgreSQL installation (`PostgreSQL 16 on port 5432`) from the dropdown -> Click **Next**.
2. Expand the **Spatial Extensions** category.
3. Check **PostGIS 3.4 Bundle for PostgreSQL 16 (64 bit)**.
4. Click **Next** -> Choose download folder -> Click **Next**.
5. When the PostGIS installer launches:
   - Accept the license agreement.
   - On the Components page, make sure **Create spatial database** is checked (or uncheck if you want to create it manually).
   - Accept the default destination path.
   - When asked *"Would you like to register the GDAL_DATA environment variable?"*, click **Yes**.
   - When asked *"Enable raster drivers?"*, click **Yes**.
   - Click **Close** when finished.

---

## 3. Verify PostGIS via psql or pgAdmin

### Option A: Using Windows Command Prompt / PowerShell
Open PowerShell or CMD and run:
```powershell
# Connect to PostgreSQL (enter your postgres password when prompted)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

### Option B: Using pgAdmin 4
1. Open **pgAdmin 4** from the Start Menu.
2. Enter your master password.
3. Right-click on **Databases** -> **Create** -> **Database...**
4. Name it: `sahakar_spatial_db` -> Click **Save**.

---

## 4. Create the Database & Enable PostGIS

Run the following SQL commands in `psql` or pgAdmin Query Tool:

```sql
-- 1. Create the Sahakar Spatial Database
CREATE DATABASE sahakar_spatial_db;

-- 2. Connect to the database
\c sahakar_spatial_db;

-- 3. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 4. Verify PostGIS is working
SELECT PostGIS_Full_Version();
```
*(You will see the PostGIS version string, e.g. `POSTGIS="3.4.0" ...`)*

---

## 5. Create the Sahakar Spatial Tables & GiST Indexes

Run this SQL to create the spatial worker tracking table and service demand table:

```sql
-- Table 1: Live Worker Spatial Locations
CREATE TABLE IF NOT EXISTS worker_locations (
    worker_id VARCHAR(64) PRIMARY KEY,
    worker_name VARCHAR(128) NOT NULL,
    trade_skill VARCHAR(64) NOT NULL,
    is_online BOOLEAN DEFAULT true,
    is_busy BOOLEAN DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    fairness_score NUMERIC(5, 2) DEFAULT 100.0,
    -- Geography Point (WGS 84 SRID 4326: standard GPS longitude & latitude)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ultra-fast spatial GiST index for radius queries (<5ms)
CREATE INDEX IF NOT EXISTS idx_worker_locations_geom 
ON worker_locations USING GIST(location);

-- Table 2: Service Demand & Customer Booking Locations
CREATE TABLE IF NOT EXISTS customer_demand_zones (
    demand_id VARCHAR(64) PRIMARY KEY,
    service_category VARCHAR(64) NOT NULL,
    urgency_level VARCHAR(32) DEFAULT 'standard',
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_demand_geom 
ON customer_demand_zones USING GIST(location);
```

---

## 6. Seed Sample Spatial Data for Testing

Run this in your database to insert sample Mumbai/Pune workers:

```sql
-- Insert verified cooperative workers in Mumbai (Bandra, Khar, Santacruz, Kurla)
INSERT INTO worker_locations (worker_id, worker_name, trade_skill, is_online, is_busy, rating, fairness_score, location)
VALUES
('w_1', 'Ramesh Patil', 'electrical', true, false, 4.9, 98.5, ST_SetSRID(ST_MakePoint(72.8360, 19.0596), 4326)), -- Bandra West
('w_2', 'Sunita Shinde', 'cleaning', true, false, 4.8, 96.0, ST_SetSRID(ST_MakePoint(72.8420, 19.0680), 4326)), -- Khar West
('w_3', 'Ganesh Kadam', 'plumbing', true, false, 4.9, 99.2, ST_SetSRID(ST_MakePoint(72.8390, 19.0820), 4326)), -- Santacruz
('w_4', 'Abdul Shaikh', 'carpentry', true, false, 4.7, 94.0, ST_SetSRID(ST_MakePoint(72.8777, 19.0650), 4326)), -- BKC
('w_5', 'Vikas More', 'painting', true, false, 4.8, 95.5, ST_SetSRID(ST_MakePoint(72.8250, 19.0520), 4326))   -- Bandra Bandstand
ON CONFLICT (worker_id) DO UPDATE 
SET location = EXCLUDED.location, last_ping = CURRENT_TIMESTAMP;
```

---

## 7. Sample PostGIS Queries (How Proximity Works)

### Find All Online Electricians within 3 km of Customer
```sql
-- ST_DWithin calculates geodesic distance in meters automatically on GEOGRAPHY types!
SELECT 
    worker_id,
    worker_name,
    trade_skill,
    rating,
    fairness_score,
    ROUND(ST_Distance(location, ST_SetSRID(ST_MakePoint(72.8380, 19.0600), 4326)::geography)::numeric, 0) AS distance_meters
FROM worker_locations
WHERE is_online = true 
  AND is_busy = false
  AND trade_skill = 'electrical'
  AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(72.8380, 19.0600), 4326)::geography, 3000)
ORDER BY distance_meters ASC, fairness_score DESC;
```

---

## 8. Backend Configuration (`.env`)

Add the following environment variables to your `.env` file in `d:\PythonProjects\REAL-SAHAKAR\.env`:

```env
# PostgreSQL + PostGIS Connection
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=sahakar_spatial_db
PG_USER=postgres
PG_PASSWORD=your_postgres_password_here
```

---

## 9. Next Steps
The backend is already equipped with `db/postgres.js` and `routes/spatial.js` so that as soon as you have PostgreSQL running, it automatically queries PostGIS for spatial queries!
