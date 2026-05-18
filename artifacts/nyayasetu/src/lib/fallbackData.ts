export const fallbackStates = [
  { stateCode: "UP", stateName: "Uttar Pradesh", pendingCases: 9842156, activeCases: 412390, registeredThisWeek: 28450, disposedThisWeek: 19230, totalCourts: 2847, disposalRate: 67.6 },
  { stateCode: "MH", stateName: "Maharashtra", pendingCases: 5123847, activeCases: 287430, registeredThisWeek: 22180, disposedThisWeek: 16540, totalCourts: 2156, disposalRate: 74.6 },
  { stateCode: "RJ", stateName: "Rajasthan", pendingCases: 3897234, activeCases: 198760, registeredThisWeek: 15320, disposedThisWeek: 11890, totalCourts: 1423, disposalRate: 77.6 },
  { stateCode: "WB", stateName: "West Bengal", pendingCases: 3541892, activeCases: 176450, registeredThisWeek: 14560, disposedThisWeek: 10230, totalCourts: 1387, disposalRate: 70.3 },
  { stateCode: "BR", stateName: "Bihar", pendingCases: 3287461, activeCases: 156780, registeredThisWeek: 13240, disposedThisWeek: 8910, totalCourts: 1234, disposalRate: 67.3 },
  { stateCode: "MP", stateName: "Madhya Pradesh", pendingCases: 2893745, activeCases: 162340, registeredThisWeek: 13890, disposedThisWeek: 10120, totalCourts: 1346, disposalRate: 72.9 },
  { stateCode: "GJ", stateName: "Gujarat", pendingCases: 2156384, activeCases: 143210, registeredThisWeek: 12340, disposedThisWeek: 9870, totalCourts: 1189, disposalRate: 80.0 },
  { stateCode: "KA", stateName: "Karnataka", pendingCases: 2134567, activeCases: 134560, registeredThisWeek: 11230, disposedThisWeek: 8780, totalCourts: 1123, disposalRate: 78.2 },
  { stateCode: "TN", stateName: "Tamil Nadu", pendingCases: 1987234, activeCases: 128450, registeredThisWeek: 10560, disposedThisWeek: 8340, totalCourts: 1087, disposalRate: 79.0 },
  { stateCode: "DL", stateName: "Delhi", pendingCases: 987654, activeCases: 87650, registeredThisWeek: 7450, disposedThisWeek: 5890, totalCourts: 564, disposalRate: 79.1 },
];

export const fallbackDashboardSummary = {
  totalPendingCases: fallbackStates.reduce((sum, state) => sum + state.pendingCases, 0),
  totalActiveCases: fallbackStates.reduce((sum, state) => sum + state.activeCases, 0),
  totalRegisteredThisWeek: fallbackStates.reduce((sum, state) => sum + state.registeredThisWeek, 0),
  totalDisposedThisWeek: fallbackStates.reduce((sum, state) => sum + state.disposedThisWeek, 0),
  totalCourts: fallbackStates.reduce((sum, state) => sum + state.totalCourts, 0),
  totalJudges: 21014,
  vacantJudgePositions: 5342,
  disposalRate: 74.9,
  lastUpdated: new Date().toISOString(),
};

export const fallbackTrends = [
  { month: "Jun 2024", filed: 1823000, disposed: 1456000, pending: 41601567 },
  { month: "Jul 2024", filed: 1956000, disposed: 1634000, pending: 41923567 },
  { month: "Aug 2024", filed: 1789000, disposed: 1523000, pending: 42189567 },
  { month: "Sep 2024", filed: 2012000, disposed: 1789000, pending: 42412567 },
  { month: "Oct 2024", filed: 1934000, disposed: 1678000, pending: 42668567 },
  { month: "Nov 2024", filed: 1678000, disposed: 1423000, pending: 42923567 },
  { month: "Dec 2024", filed: 1245000, disposed: 1089000, pending: 43079567 },
  { month: "Jan 2025", filed: 1987000, disposed: 1712000, pending: 43354567 },
  { month: "Feb 2025", filed: 2134000, disposed: 1867000, pending: 43621567 },
  { month: "Mar 2025", filed: 2289000, disposed: 1923000, pending: 43987567 },
  { month: "Apr 2025", filed: 2156000, disposed: 1834000, pending: 44309567 },
  { month: "May 2025", filed: 2312000, disposed: 1978000, pending: 44643567 },
];

export const fallbackCourtTypes = [
  { courtType: "District & Sessions Courts", pendingCases: 18234567, activeCases: 1234560, totalCourts: 672 },
  { courtType: "Civil Judge Courts", pendingCases: 12456789, activeCases: 876540, totalCourts: 1456 },
  { courtType: "Judicial Magistrate Courts", pendingCases: 8765432, activeCases: 654320, totalCourts: 2134 },
  { courtType: "Family Courts", pendingCases: 2345678, activeCases: 178900, totalCourts: 478 },
  { courtType: "Fast Track Courts", pendingCases: 1234567, activeCases: 123450, totalCourts: 934 },
];

export const fallbackCategories = [
  { category: "Civil Matters", count: 18234567, percentage: 37.8 },
  { category: "Criminal Matters", count: 15678234, percentage: 32.5 },
  { category: "Motor Accident", count: 4567890, percentage: 9.5 },
  { category: "Family Disputes", count: 3456789, percentage: 7.2 },
  { category: "Labour Disputes", count: 2345678, percentage: 4.9 },
  { category: "Revenue Matters", count: 1987654, percentage: 4.1 },
  { category: "Rent & Property", count: 1234567, percentage: 2.6 },
  { category: "Others", count: 709097, percentage: 1.4 },
];

export const fallbackDistricts = [
  { districtName: "Allahabad", pendingCases: 412345, activeCases: 28760, registeredThisWeek: 2230, disposedThisWeek: 1560 },
  { districtName: "Lucknow", pendingCases: 345678, activeCases: 23450, registeredThisWeek: 1890, disposedThisWeek: 1234 },
  { districtName: "Kanpur", pendingCases: 287654, activeCases: 19870, registeredThisWeek: 1560, disposedThisWeek: 1090 },
  { districtName: "Varanasi", pendingCases: 234567, activeCases: 16540, registeredThisWeek: 1340, disposedThisWeek: 920 },
  { districtName: "Agra", pendingCases: 198765, activeCases: 13450, registeredThisWeek: 1090, disposedThisWeek: 780 },
];
