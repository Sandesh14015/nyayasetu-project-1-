import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let poolInstance: pg.Pool | undefined;
let dbInstance: ReturnType<typeof drizzle> | null = null;
export let dbConnected = false;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  poolInstance = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await poolInstance.query("SELECT 1");
    dbInstance = drizzle(poolInstance, { schema });
    dbConnected = true;
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    if (process.env.NODE_ENV !== "development") {
      throw error;
    }
    console.warn(
      "Running in development mode with no database connection. Data will not persist across restarts.",
    );
  }
} else if (process.env.NODE_ENV !== "development") {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
} else {
  console.warn(
    "DATABASE_URL is not set. Running in development mode with no database connection.",
  );
}

export const pool = poolInstance;
export const db = dbInstance;
export * from "./schema";
export {
  stateStatsTable,
  districtStatsTable,
  monthlyTrendsTable,
  courtTypeStatsTable,
  caseCategoryStatsTable,
} from "./schema/judicial";
