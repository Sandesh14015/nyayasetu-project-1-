import { useGetDashboardSummary, useListStates, useGetCourtTypeBreakdown, useGetTopPendingStates, useGetCaseCategories, useGetMonthlyTrends, getGetDashboardSummaryQueryKey, getListStatesQueryKey, getGetMonthlyTrendsQueryKey, getGetCourtTypeBreakdownQueryKey, getGetTopPendingStatesQueryKey, getGetCaseCategoriesQueryKey } from "@workspace/api-client-react";
import { formatNumber, formatCompactNumber, formatPercentage } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, TrendingUp, AlertTriangle, CheckCircle2, Clock, ExternalLink, Search, FileText, CreditCard, Gavel, Phone, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StateGrid from "@/components/StateGrid";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell as PieCell } from "recharts";
import { motion } from "framer-motion";
import { fallbackCategories, fallbackCourtTypes, fallbackDashboardSummary, fallbackStates, fallbackTrends } from "@/lib/fallbackData";

const REFETCH_INTERVAL = 30000;

const ECOURTS_SERVICES = [
  {
    label: "Case Status",
    description: "Track your case by CNR number, party name, or FIR",
    href: "https://services.ecourts.gov.in/ecourtindia_v6/",
    icon: Search,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    label: "eFiling",
    description: "File cases online without visiting the court",
    href: "https://efiling.ecourts.gov.in/",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    label: "ePay",
    description: "Pay court fees and fines electronically",
    href: "https://pay.ecourts.gov.in/",
    icon: CreditCard,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    label: "Cause List",
    description: "View daily court cause lists and hearing schedules",
    href: "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/getCaseStatus",
    icon: Gavel,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    label: "Tele-Law",
    description: "Free legal advice via video call at CSC centres",
    href: "https://doj.gov.in/legal-aid/tele-law/",
    icon: Phone,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    label: "Free Legal Aid",
    description: "NALSA services for eligible citizens",
    href: "https://nalsa.gov.in/",
    icon: Users,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
];

export default function Dashboard() {
  const { data: summaryData, isLoading: isLoadingSummaryData, isError: isSummaryError } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: REFETCH_INTERVAL }
  });
  const summary = summaryData ?? fallbackDashboardSummary;
  const isLoadingSummary = isLoadingSummaryData && !summaryData;

  const { data: statesData, isLoading: isLoadingStatesData, isError: isStatesError } = useListStates({
    query: { queryKey: getListStatesQueryKey(), refetchInterval: REFETCH_INTERVAL }
  });
  const states = Array.isArray(statesData) && statesData.length > 0 ? statesData : fallbackStates;
  const isLoadingStates = isLoadingStatesData && !statesData;

  const { data: trends, isLoading: isLoadingTrendsData, isError: isTrendsError } = useGetMonthlyTrends(undefined, {
    query: { queryKey: getGetMonthlyTrendsQueryKey(), refetchInterval: REFETCH_INTERVAL }
  });
  const trendsArray = Array.isArray(trends) && trends.length > 0 ? trends : fallbackTrends;
  const isLoadingTrends = isLoadingTrendsData && !trends;

  const { data: courtTypes, isLoading: isLoadingCourtTypesData, isError: isCourtTypesError } = useGetCourtTypeBreakdown({
    query: { queryKey: getGetCourtTypeBreakdownQueryKey(), refetchInterval: REFETCH_INTERVAL }
  });
  const courtTypesArray = Array.isArray(courtTypes) && courtTypes.length > 0 ? courtTypes : fallbackCourtTypes;
  const isLoadingCourtTypes = isLoadingCourtTypesData && !courtTypes;

  const { data: topStates } = useGetTopPendingStates({
    query: { queryKey: getGetTopPendingStatesQueryKey(), refetchInterval: REFETCH_INTERVAL }
  });
  const topStatesArray = Array.isArray(topStates) ? topStates : [];

  const { data: categories, isLoading: isLoadingCategoriesData, isError: isCategoriesError } = useGetCaseCategories(undefined, {
    query: { queryKey: getGetCaseCategoriesQueryKey(), refetchInterval: REFETCH_INTERVAL }
  });
  const safeCategories = Array.isArray(categories) && categories.length > 0 ? categories : fallbackCategories;
  const isLoadingCategories = isLoadingCategoriesData && !categories;

  const pieColors = ["#E85D04", "#2563EB", "#16A34A", "#0EA5E9", "#EAB308", "#8B5CF6", "#EC4899", "#F43F5E"];
  const usingFallbackData = isSummaryError || isStatesError || isTrendsError || isCourtTypesError || isCategoriesError;

  return (
    <div className="container py-8 max-w-screen-2xl space-y-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">National Judicial Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of the Indian judicial system.{" "}
            <a
              href="https://njdg.ecourts.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:no-underline text-xs font-medium"
            >
              Data: NJDG
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border">
          <Clock className="h-4 w-4" />
          <span>Last updated: {summary ? new Date(summary.lastUpdated).toLocaleTimeString() : "..."}</span>
          <span className="relative flex h-2 w-2 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs ml-1 font-medium">Live</span>
        </div>
      </div>

      {usingFallbackData && (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          Live database data is unavailable, so the dashboard is showing bundled demo data.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Pending Cases"
          value={summary?.totalPendingCases}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          loading={isLoadingSummary}
          description="Across all courts"
        />
        <SummaryCard
          title="Active Cases"
          value={summary?.totalActiveCases}
          icon={<Scale className="h-5 w-5 text-blue-500" />}
          loading={isLoadingSummary}
          description="Currently in hearing"
        />
        <SummaryCard
          title="Registered This Week"
          value={summary?.totalRegisteredThisWeek}
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          loading={isLoadingSummary}
          description="New filings"
        />
        <SummaryCard
          title="Disposal Rate"
          value={summary?.disposalRate ? formatPercentage(summary.disposalRate) : undefined}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          loading={isLoadingSummary}
          description="Cases resolved vs filed"
          isValueString
        />
      </div>

      {/* eCourts Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">eCourts Services</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Access official government judicial services directly</p>
          </div>
          <a
            href="https://ecourts.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Visit eCourts Portal
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ECOURTS_SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <motion.a
                key={service.label}
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className={`flex flex-col gap-2.5 p-4 rounded-xl border ${service.border} ${service.bg} hover:shadow-md transition-shadow cursor-pointer group`}
                data-testid={`ecourts-service-${service.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`h-9 w-9 rounded-lg bg-white/80 flex items-center justify-center shadow-sm`}>
                  <Icon className={`h-5 w-5 ${service.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{service.label}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{service.description}</p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle>Case Trends</CardTitle>
            <CardDescription>Monthly filing vs disposal across all courts</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-[300px]">
            {isLoadingTrends ? (
              <Skeleton className="h-[250px] w-full" />
            ) : trendsArray.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsArray} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E85D04" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E85D04" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDisposed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => formatCompactNumber(val)} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Tooltip
                      formatter={(value: number) => formatNumber(value)}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="filed" name="Cases Filed" stroke="#E85D04" strokeWidth={2} fillOpacity={1} fill="url(#colorFiled)" />
                    <Area type="monotone" dataKey="disposed" name="Cases Disposed" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorDisposed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle>Case Categories</CardTitle>
            <CardDescription>Breakdown by case type</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-[300px]">
            {isLoadingCategories ? (
              <Skeleton className="h-[250px] w-full rounded-full" />
            ) : safeCategories && safeCategories.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="category"
                    >
                      {safeCategories.map((_entry, index) => (
                        <PieCell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _name: string, props: { payload?: { percentage?: number } }) => [
                        `${formatNumber(value)} (${formatPercentage(props.payload?.percentage ?? 0)})`,
                        _name,
                      ]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Court Type Breakdown */}
      <Card className="shadow-sm border-border">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle>Pending Cases by Court Type</CardTitle>
          <CardDescription>Distribution across court tiers</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingCourtTypes ? (
            <Skeleton className="h-[200px] w-full" />
          ) : courtTypesArray.length > 0 ? (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courtTypesArray} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => formatCompactNumber(val)} />
                  <YAxis type="category" dataKey="courtType" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={180} />
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="pendingCases" name="Pending Cases" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* State Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">State Distribution</h2>
          <p className="text-sm text-muted-foreground">Select a state to view district-level details</p>
        </div>
        <StateGrid states={states} loading={isLoadingStates} />
      </div>

    </div>
  );
}

function SummaryCard({ title, value, icon, loading, description, isValueString = false }: {
  title: string;
  value?: number | string;
  icon: React.ReactNode;
  loading: boolean;
  description: string;
  isValueString?: boolean;
}) {
  return (
    <Card className="shadow-sm border-border overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-2xl font-bold text-foreground">
            {value !== undefined ? (isValueString ? value : formatNumber(value as number)) : "--"}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
