/**
 * Database seed script — populates NJDG-style data for all 30 Indian states.
 * Run with: pnpm --filter @workspace/scripts run seed
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  stateStatsTable,
  districtStatsTable,
  monthlyTrendsTable,
  courtTypeStatsTable,
  caseCategoryStatsTable,
} from "../../lib/db/src/schema/judicial.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined,
});
await client.connect();
const db = drizzle(client);

// ── States ────────────────────────────────────────────────────────────────────
const states = [
  { stateCode: "UP", stateName: "Uttar Pradesh",       pendingCases: 9842156, activeCases: 412390, registeredThisWeek: 28450, disposedThisWeek: 19230, totalCourts: 2847, disposalRate: "67.6" },
  { stateCode: "MH", stateName: "Maharashtra",          pendingCases: 5123847, activeCases: 287430, registeredThisWeek: 22180, disposedThisWeek: 16540, totalCourts: 2156, disposalRate: "74.6" },
  { stateCode: "RJ", stateName: "Rajasthan",            pendingCases: 3897234, activeCases: 198760, registeredThisWeek: 15320, disposedThisWeek: 11890, totalCourts: 1423, disposalRate: "77.6" },
  { stateCode: "WB", stateName: "West Bengal",          pendingCases: 3541892, activeCases: 176450, registeredThisWeek: 14560, disposedThisWeek: 10230, totalCourts: 1387, disposalRate: "70.3" },
  { stateCode: "BR", stateName: "Bihar",                pendingCases: 3287461, activeCases: 156780, registeredThisWeek: 13240, disposedThisWeek:  8910, totalCourts: 1234, disposalRate: "67.3" },
  { stateCode: "MP", stateName: "Madhya Pradesh",       pendingCases: 2893745, activeCases: 162340, registeredThisWeek: 13890, disposedThisWeek: 10120, totalCourts: 1346, disposalRate: "72.9" },
  { stateCode: "GJ", stateName: "Gujarat",              pendingCases: 2156384, activeCases: 143210, registeredThisWeek: 12340, disposedThisWeek:  9870, totalCourts: 1189, disposalRate: "80.0" },
  { stateCode: "KA", stateName: "Karnataka",            pendingCases: 2134567, activeCases: 134560, registeredThisWeek: 11230, disposedThisWeek:  8780, totalCourts: 1123, disposalRate: "78.2" },
  { stateCode: "TN", stateName: "Tamil Nadu",           pendingCases: 1987234, activeCases: 128450, registeredThisWeek: 10560, disposedThisWeek:  8340, totalCourts: 1087, disposalRate: "79.0" },
  { stateCode: "HR", stateName: "Haryana",              pendingCases: 1234890, activeCases:  92340, registeredThisWeek:  7890, disposedThisWeek:  5670, totalCourts:  723, disposalRate: "71.9" },
  { stateCode: "OD", stateName: "Odisha",               pendingCases: 1123456, activeCases:  87650, registeredThisWeek:  7230, disposedThisWeek:  5340, totalCourts:  678, disposalRate: "73.9" },
  { stateCode: "AP", stateName: "Andhra Pradesh",       pendingCases: 1234567, activeCases:  98760, registeredThisWeek:  8230, disposedThisWeek:  6780, totalCourts:  834, disposalRate: "82.4" },
  { stateCode: "TS", stateName: "Telangana",            pendingCases: 1087345, activeCases:  87650, registeredThisWeek:  7340, disposedThisWeek:  6120, totalCourts:  756, disposalRate: "83.4" },
  { stateCode: "DL", stateName: "Delhi",                pendingCases:  987654, activeCases:  87650, registeredThisWeek:  7450, disposedThisWeek:  5890, totalCourts:  564, disposalRate: "79.1" },
  { stateCode: "KL", stateName: "Kerala",               pendingCases:  987234, activeCases:  78920, registeredThisWeek:  6780, disposedThisWeek:  5890, totalCourts:  678, disposalRate: "86.9" },
  { stateCode: "PB", stateName: "Punjab",               pendingCases:  897234, activeCases:  67450, registeredThisWeek:  5670, disposedThisWeek:  4230, totalCourts:  567, disposalRate: "74.6" },
  { stateCode: "JH", stateName: "Jharkhand",            pendingCases:  876543, activeCases:  65430, registeredThisWeek:  5430, disposedThisWeek:  3890, totalCourts:  456, disposalRate: "71.6" },
  { stateCode: "CG", stateName: "Chhattisgarh",         pendingCases:  654321, activeCases:  52340, registeredThisWeek:  4320, disposedThisWeek:  3120, totalCourts:  387, disposalRate: "72.2" },
  { stateCode: "AS", stateName: "Assam",                pendingCases:  678234, activeCases:  54320, registeredThisWeek:  4560, disposedThisWeek:  3230, totalCourts:  423, disposalRate: "70.8" },
  { stateCode: "UK", stateName: "Uttarakhand",          pendingCases:  456789, activeCases:  38760, registeredThisWeek:  3210, disposedThisWeek:  2450, totalCourts:  287, disposalRate: "76.3" },
  { stateCode: "JK", stateName: "Jammu & Kashmir",      pendingCases:  312456, activeCases:  27890, registeredThisWeek:  2340, disposedThisWeek:  1780, totalCourts:  234, disposalRate: "76.1" },
  { stateCode: "HP", stateName: "Himachal Pradesh",     pendingCases:  234567, activeCases:  21230, registeredThisWeek:  1780, disposedThisWeek:  1430, totalCourts:  198, disposalRate: "80.3" },
  { stateCode: "TR", stateName: "Tripura",              pendingCases:   56789, activeCases:   5340, registeredThisWeek:   445, disposedThisWeek:   340, totalCourts:   56, disposalRate: "76.4" },
  { stateCode: "GA", stateName: "Goa",                  pendingCases:   87654, activeCases:   8760, registeredThisWeek:   720, disposedThisWeek:   598, totalCourts:   87, disposalRate: "83.1" },
  { stateCode: "MN", stateName: "Manipur",              pendingCases:   45678, activeCases:   4320, registeredThisWeek:   360, disposedThisWeek:   278, totalCourts:   45, disposalRate: "77.2" },
  { stateCode: "MG", stateName: "Meghalaya",            pendingCases:   34567, activeCases:   3210, registeredThisWeek:   270, disposedThisWeek:   210, totalCourts:   34, disposalRate: "77.8" },
  { stateCode: "AR", stateName: "Arunachal Pradesh",    pendingCases:   18765, activeCases:   1650, registeredThisWeek:   138, disposedThisWeek:   107, totalCourts:   18, disposalRate: "77.5" },
  { stateCode: "MZ", stateName: "Mizoram",              pendingCases:   16543, activeCases:   1450, registeredThisWeek:   123, disposedThisWeek:    95, totalCourts:   16, disposalRate: "77.2" },
  { stateCode: "NL", stateName: "Nagaland",             pendingCases:   23456, activeCases:   2190, registeredThisWeek:   185, disposedThisWeek:   142, totalCourts:   23, disposalRate: "76.8" },
  { stateCode: "SK", stateName: "Sikkim",               pendingCases:   12345, activeCases:   1120, registeredThisWeek:    95, disposedThisWeek:    78, totalCourts:   12, disposalRate: "82.1" },
];

console.log("Seeding states...");
for (const s of states) {
  await db.insert(stateStatsTable).values(s).onConflictDoUpdate({
    target: stateStatsTable.stateCode,
    set: {
      pendingCases: s.pendingCases,
      activeCases: s.activeCases,
      registeredThisWeek: s.registeredThisWeek,
      disposedThisWeek: s.disposedThisWeek,
      totalCourts: s.totalCourts,
      disposalRate: s.disposalRate,
    },
  });
}
console.log(`  ✓ ${states.length} states`);

// ── Districts ─────────────────────────────────────────────────────────────────
const districts = [
  { stateCode: "UP", districtName: "Allahabad",   pendingCases: 412345, activeCases: 28760, registeredThisWeek: 2230, disposedThisWeek: 1560 },
  { stateCode: "UP", districtName: "Lucknow",     pendingCases: 345678, activeCases: 23450, registeredThisWeek: 1890, disposedThisWeek: 1234 },
  { stateCode: "UP", districtName: "Kanpur",      pendingCases: 287654, activeCases: 19870, registeredThisWeek: 1560, disposedThisWeek: 1090 },
  { stateCode: "UP", districtName: "Varanasi",    pendingCases: 234567, activeCases: 16540, registeredThisWeek: 1340, disposedThisWeek:  920 },
  { stateCode: "UP", districtName: "Agra",        pendingCases: 198765, activeCases: 13450, registeredThisWeek: 1090, disposedThisWeek:  780 },
  { stateCode: "MH", districtName: "Mumbai",      pendingCases: 456789, activeCases: 34560, registeredThisWeek: 2890, disposedThisWeek: 2340 },
  { stateCode: "MH", districtName: "Pune",        pendingCases: 287654, activeCases: 21230, registeredThisWeek: 1780, disposedThisWeek: 1450 },
  { stateCode: "MH", districtName: "Nagpur",      pendingCases: 198765, activeCases: 15430, registeredThisWeek: 1230, disposedThisWeek:  980 },
  { stateCode: "MH", districtName: "Nashik",      pendingCases: 145678, activeCases: 11230, registeredThisWeek:  890, disposedThisWeek:  720 },
  { stateCode: "MH", districtName: "Aurangabad",  pendingCases: 134567, activeCases: 10230, registeredThisWeek:  820, disposedThisWeek:  660 },
  { stateCode: "DL", districtName: "New Delhi",   pendingCases: 123456, activeCases: 12340, registeredThisWeek: 1020, disposedThisWeek:  890 },
  { stateCode: "DL", districtName: "North Delhi", pendingCases:  98765, activeCases:  9870, registeredThisWeek:  820, disposedThisWeek:  650 },
  { stateCode: "DL", districtName: "South Delhi", pendingCases:  87654, activeCases:  8760, registeredThisWeek:  730, disposedThisWeek:  580 },
  { stateCode: "DL", districtName: "East Delhi",  pendingCases:  76543, activeCases:  7650, registeredThisWeek:  640, disposedThisWeek:  490 },
  { stateCode: "DL", districtName: "West Delhi",  pendingCases:  65432, activeCases:  6540, registeredThisWeek:  540, disposedThisWeek:  430 },
  { stateCode: "TN", districtName: "Chennai",     pendingCases: 234567, activeCases: 19870, registeredThisWeek: 1670, disposedThisWeek: 1340 },
  { stateCode: "TN", districtName: "Coimbatore",  pendingCases: 145678, activeCases: 12340, registeredThisWeek: 1030, disposedThisWeek:  820 },
  { stateCode: "TN", districtName: "Madurai",     pendingCases: 123456, activeCases: 10450, registeredThisWeek:  870, disposedThisWeek:  690 },
  { stateCode: "KA", districtName: "Bengaluru",   pendingCases: 456789, activeCases: 34560, registeredThisWeek: 2890, disposedThisWeek: 2340 },
  { stateCode: "KA", districtName: "Mysuru",      pendingCases: 134567, activeCases: 10230, registeredThisWeek:  850, disposedThisWeek:  680 },
  { stateCode: "KA", districtName: "Hubballi",    pendingCases:  98765, activeCases:  7650, registeredThisWeek:  640, disposedThisWeek:  510 },
];

console.log("Seeding districts...");
await db.insert(districtStatsTable).values(districts);
console.log(`  ✓ ${districts.length} districts`);

// ── Monthly trends (national, last 12 months) ─────────────────────────────────
const months = [
  "Jun 2024","Jul 2024","Aug 2024","Sep 2024","Oct 2024","Nov 2024",
  "Dec 2024","Jan 2025","Feb 2025","Mar 2025","Apr 2025","May 2025",
];
const filed    = [1823000,1956000,1789000,2012000,1934000,1678000,1245000,1987000,2134000,2289000,2156000,2312000];
const disposed = [1456000,1634000,1523000,1789000,1678000,1423000,1089000,1712000,1867000,1923000,1834000,1978000];

console.log("Seeding monthly trends...");
let pending = 41234567;
for (let i = 0; i < months.length; i++) {
  pending += filed[i] - disposed[i];
  await db.insert(monthlyTrendsTable).values({ stateCode: null, month: months[i], filed: filed[i], disposed: disposed[i], pending });
}
console.log(`  ✓ ${months.length} months`);

// ── Court types ───────────────────────────────────────────────────────────────
const courtTypes = [
  { courtType: "District & Sessions Courts",        pendingCases: 18234567, activeCases: 1234560, totalCourts:  672 },
  { courtType: "Civil Judge Courts",                pendingCases: 12456789, activeCases:  876540, totalCourts: 1456 },
  { courtType: "Judicial Magistrate Courts",        pendingCases:  8765432, activeCases:  654320, totalCourts: 2134 },
  { courtType: "Executive Magistrate Courts",       pendingCases:  3456789, activeCases:  234560, totalCourts: 1876 },
  { courtType: "Family Courts",                     pendingCases:  2345678, activeCases:  178900, totalCourts:  478 },
  { courtType: "Fast Track Courts",                 pendingCases:  1234567, activeCases:  123450, totalCourts:  934 },
  { courtType: "Motor Accident Claims Tribunals",   pendingCases:   987654, activeCases:   87650, totalCourts:  234 },
];

console.log("Seeding court types...");
await db.insert(courtTypeStatsTable).values(courtTypes);
console.log(`  ✓ ${courtTypes.length} court types`);

// ── Case categories (national) ────────────────────────────────────────────────
const categories = [
  { stateCode: null, category: "Civil Matters",       count: 18234567, percentage: "37.8" },
  { stateCode: null, category: "Criminal Matters",    count: 15678234, percentage: "32.5" },
  { stateCode: null, category: "Motor Accident",      count:  4567890, percentage:  "9.5" },
  { stateCode: null, category: "Family Disputes",     count:  3456789, percentage:  "7.2" },
  { stateCode: null, category: "Labour Disputes",     count:  2345678, percentage:  "4.9" },
  { stateCode: null, category: "Revenue Matters",     count:  1987654, percentage:  "4.1" },
  { stateCode: null, category: "Rent & Property",     count:  1234567, percentage:  "2.6" },
  { stateCode: null, category: "Others",              count:   709097, percentage:  "1.4" },
];

console.log("Seeding case categories...");
await db.insert(caseCategoryStatsTable).values(categories);
console.log(`  ✓ ${categories.length} categories`);

await client.end();
console.log("\nDone! Database seeded successfully.");
