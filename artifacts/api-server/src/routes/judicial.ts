import { Router, type IRouter } from "express";
import {
  db,
  stateStatsTable,
  districtStatsTable,
  monthlyTrendsTable,
  courtTypeStatsTable,
  caseCategoryStatsTable,
} from "@workspace/db";
import {
  GetStateDetailsParams,
  GetMonthlyTrendsQueryParams,
  GetCaseCategoriesQueryParams,
} from "@workspace/api-zod";
import { eq, isNull, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/judicial/dashboard-summary", async (req, res): Promise<void> => {
  const states = await db.select().from(stateStatsTable);
  const courts = await db.select().from(courtTypeStatsTable);

  const totalPendingCases = states.reduce((s, r) => s + r.pendingCases, 0);
  const totalActiveCases = states.reduce((s, r) => s + r.activeCases, 0);
  const totalRegisteredThisWeek = states.reduce((s, r) => s + r.registeredThisWeek, 0);
  const totalDisposedThisWeek = states.reduce((s, r) => s + r.disposedThisWeek, 0);
  const totalCourts = courts.reduce((s, r) => s + r.totalCourts, 0);

  const disposalRate =
    totalRegisteredThisWeek > 0
      ? Math.round((totalDisposedThisWeek / totalRegisteredThisWeek) * 100 * 10) / 10
      : 0;

  res.json({
    totalPendingCases,
    totalActiveCases,
    totalRegisteredThisWeek,
    totalDisposedThisWeek,
    totalCourts,
    totalJudges: 21014,
    vacantJudgePositions: 5342,
    disposalRate,
    lastUpdated: new Date().toISOString(),
  });
});

router.get("/judicial/states", async (_req, res): Promise<void> => {
  const states = await db
    .select()
    .from(stateStatsTable)
    .orderBy(desc(stateStatsTable.pendingCases));

  res.json(
    states.map((s) => ({
      stateCode: s.stateCode,
      stateName: s.stateName,
      pendingCases: s.pendingCases,
      activeCases: s.activeCases,
      registeredThisWeek: s.registeredThisWeek,
      disposedThisWeek: s.disposedThisWeek,
      totalCourts: s.totalCourts,
      disposalRate: Number(s.disposalRate),
    }))
  );
});

router.get("/judicial/states/:stateCode", async (req, res): Promise<void> => {
  const params = GetStateDetailsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [state] = await db
    .select()
    .from(stateStatsTable)
    .where(eq(stateStatsTable.stateCode, params.data.stateCode));

  if (!state) {
    res.status(404).json({ error: "State not found" });
    return;
  }

  const districts = await db
    .select()
    .from(districtStatsTable)
    .where(eq(districtStatsTable.stateCode, params.data.stateCode))
    .orderBy(desc(districtStatsTable.pendingCases));

  res.json({
    stateCode: state.stateCode,
    stateName: state.stateName,
    pendingCases: state.pendingCases,
    activeCases: state.activeCases,
    registeredThisWeek: state.registeredThisWeek,
    disposedThisWeek: state.disposedThisWeek,
    totalCourts: state.totalCourts,
    disposalRate: Number(state.disposalRate),
    districts: districts.map((d) => ({
      districtName: d.districtName,
      pendingCases: d.pendingCases,
      activeCases: d.activeCases,
      registeredThisWeek: d.registeredThisWeek,
      disposedThisWeek: d.disposedThisWeek,
    })),
  });
});

router.get("/judicial/monthly-trends", async (req, res): Promise<void> => {
  const query = GetMonthlyTrendsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows;
  if (query.data.stateCode) {
    rows = await db
      .select()
      .from(monthlyTrendsTable)
      .where(eq(monthlyTrendsTable.stateCode, query.data.stateCode));
  } else {
    rows = await db
      .select()
      .from(monthlyTrendsTable)
      .where(isNull(monthlyTrendsTable.stateCode));
  }

  res.json(
    rows.map((r) => ({
      month: r.month,
      filed: r.filed,
      disposed: r.disposed,
      pending: r.pending,
    }))
  );
});

router.get("/judicial/court-types", async (_req, res): Promise<void> => {
  const rows = await db.select().from(courtTypeStatsTable);
  res.json(
    rows.map((r) => ({
      courtType: r.courtType,
      pendingCases: r.pendingCases,
      activeCases: r.activeCases,
      totalCourts: r.totalCourts,
    }))
  );
});

router.get("/judicial/top-pending-states", async (_req, res): Promise<void> => {
  const states = await db
    .select()
    .from(stateStatsTable)
    .orderBy(desc(stateStatsTable.pendingCases))
    .limit(10);

  res.json(
    states.map((s) => ({
      stateCode: s.stateCode,
      stateName: s.stateName,
      pendingCases: s.pendingCases,
      activeCases: s.activeCases,
      registeredThisWeek: s.registeredThisWeek,
      disposedThisWeek: s.disposedThisWeek,
      totalCourts: s.totalCourts,
      disposalRate: Number(s.disposalRate),
    }))
  );
});

router.get("/judicial/case-categories", async (req, res): Promise<void> => {
  const query = GetCaseCategoriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows;
  if (query.data.stateCode) {
    rows = await db
      .select()
      .from(caseCategoryStatsTable)
      .where(eq(caseCategoryStatsTable.stateCode, query.data.stateCode));
  } else {
    rows = await db
      .select()
      .from(caseCategoryStatsTable)
      .where(isNull(caseCategoryStatsTable.stateCode));
  }

  res.json(
    rows.map((r) => ({
      category: r.category,
      count: r.count,
      percentage: Number(r.percentage),
    }))
  );
});

export default router;
