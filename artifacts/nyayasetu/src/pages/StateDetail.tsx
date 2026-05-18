import { useGetStateDetails, useGetMonthlyTrends, getGetStateDetailsQueryKey, getGetMonthlyTrendsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Building2, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { formatNumber, formatCompactNumber, formatPercentage } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { fallbackDistricts, fallbackStates, fallbackTrends } from "@/lib/fallbackData";

const REFETCH_INTERVAL = 30000;

export default function StateDetail() {
  const { stateCode } = useParams<{ stateCode: string }>();
  const currentStateCode = stateCode ?? "";
  
  const { data: stateData, isLoading: isLoadingState, isError: isStateError } = useGetStateDetails(currentStateCode, {
    query: { queryKey: getGetStateDetailsQueryKey(currentStateCode), refetchInterval: REFETCH_INTERVAL, enabled: !!stateCode }
  });

  const fallbackState = fallbackStates.find((item) => item.stateCode === currentStateCode);
  const state = stateData ?? (fallbackState ? { ...fallbackState, districts: fallbackDistricts } : undefined);

  const { data: trendsData, isLoading: isLoadingTrendsData, isError: isTrendsError } = useGetMonthlyTrends({ stateCode }, {
    query: { queryKey: getGetMonthlyTrendsQueryKey({ stateCode }), refetchInterval: REFETCH_INTERVAL, enabled: !!stateCode }
  });
  const trends = Array.isArray(trendsData) && trendsData.length > 0 ? trendsData : fallbackTrends;
  const isLoadingTrends = isLoadingTrendsData && !trendsData;
  const usingFallbackData = isStateError || isTrendsError || !stateData;

  if (isLoadingState && !state) {
    return <div className="container py-8 max-w-screen-2xl">Loading...</div>;
  }

  if (!state) {
    return <div className="container py-8 max-w-screen-2xl">State not found.</div>;
  }

  return (
    <div className="container py-8 max-w-screen-2xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{state.stateName}</h1>
          <p className="text-muted-foreground mt-1">State Judicial Statistics</p>
        </div>
      </div>

      {usingFallbackData && (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          Live database data is unavailable, so this page is showing bundled demo data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Cases" value={state.pendingCases} icon={<AlertTriangle className="h-5 w-5 text-orange-500" />} />
        <StatCard title="Active Cases" value={state.activeCases} icon={<TrendingUp className="h-5 w-5 text-blue-500" />} />
        <StatCard title="Total Courts" value={state.totalCourts} icon={<Building2 className="h-5 w-5 text-purple-500" />} />
        <StatCard title="Disposal Rate" value={formatPercentage(state.disposalRate)} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} isString />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle>State Trends</CardTitle>
            <CardDescription>Monthly filing vs disposal</CardDescription>
          </CardHeader>
          <CardContent className="p-6 min-h-[300px]">
            {isLoadingTrends ? (
              <Skeleton className="h-[250px] w-full" />
            ) : trends && trends.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFiledState" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E85D04" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E85D04" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDisposedState" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => formatCompactNumber(val)} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Tooltip formatter={(value: number) => formatNumber(value)} contentStyle={{ borderRadius: '8px' }} />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="filed" name="Cases Filed" stroke="#E85D04" strokeWidth={2} fillOpacity={1} fill="url(#colorFiledState)" />
                    <Area type="monotone" dataKey="disposed" name="Cases Disposed" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorDisposedState)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle>District Breakdown</CardTitle>
            <CardDescription>Cases by district</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="w-[150px]">District</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Disposed (Wk)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.districts.sort((a, b) => b.pendingCases - a.pendingCases).map((dist) => (
                    <TableRow key={dist.districtName}>
                      <TableCell className="font-medium">{dist.districtName}</TableCell>
                      <TableCell className="text-right font-semibold text-orange-600 dark:text-orange-400">{formatNumber(dist.pendingCases)}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">{formatNumber(dist.disposedThisWeek)}</TableCell>
                    </TableRow>
                  ))}
                  {state.districts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No districts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isString = false }: { title: string, value: number | string, icon: React.ReactNode, isString?: boolean }) {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {isString ? value : formatNumber(value as number)}
        </div>
      </CardContent>
    </Card>
  );
}
