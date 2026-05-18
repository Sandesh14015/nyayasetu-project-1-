import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS conversations (
    id serial PRIMARY KEY,
    title text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS messages (
    id serial PRIMARY KEY,
    conversation_id integer NOT NULL REFERENCES conversations(id) ON DELETE cascade,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS state_stats (
    id serial PRIMARY KEY,
    state_code text NOT NULL UNIQUE,
    state_name text NOT NULL,
    pending_cases integer NOT NULL DEFAULT 0,
    active_cases integer NOT NULL DEFAULT 0,
    registered_this_week integer NOT NULL DEFAULT 0,
    disposed_this_week integer NOT NULL DEFAULT 0,
    total_courts integer NOT NULL DEFAULT 0,
    disposal_rate numeric(5, 2) NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS district_stats (
    id serial PRIMARY KEY,
    state_code text NOT NULL,
    district_name text NOT NULL,
    pending_cases integer NOT NULL DEFAULT 0,
    active_cases integer NOT NULL DEFAULT 0,
    registered_this_week integer NOT NULL DEFAULT 0,
    disposed_this_week integer NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS monthly_trends (
    id serial PRIMARY KEY,
    state_code text,
    month text NOT NULL,
    filed integer NOT NULL DEFAULT 0,
    disposed integer NOT NULL DEFAULT 0,
    pending integer NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS court_type_stats (
    id serial PRIMARY KEY,
    court_type text NOT NULL,
    pending_cases integer NOT NULL DEFAULT 0,
    active_cases integer NOT NULL DEFAULT 0,
    total_courts integer NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS case_category_stats (
    id serial PRIMARY KEY,
    state_code text,
    category text NOT NULL,
    count integer NOT NULL DEFAULT 0,
    percentage numeric(5, 2) NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  );

  TRUNCATE TABLE
    district_stats,
    monthly_trends,
    court_type_stats,
    case_category_stats
  RESTART IDENTITY;
`);

await client.end();

console.log("Database schema is ready.");
