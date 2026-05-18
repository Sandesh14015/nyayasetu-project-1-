export function formatNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat('en-IN', { notation: "compact", compactDisplay: "short" }).format(num);
}

export function formatPercentage(num: number): string {
  if (num === undefined || num === null) return "0%";
  return `${num.toFixed(1)}%`;
}

export function getStateColorClass(pendingCases: number, maxPending: number): string {
  if (!maxPending) return "bg-gray-100 border-gray-200";
  const ratio = pendingCases / maxPending;
  
  if (ratio > 0.8) return "bg-red-50 border-red-200 hover:border-red-300";
  if (ratio > 0.5) return "bg-orange-50 border-orange-200 hover:border-orange-300";
  if (ratio > 0.2) return "bg-amber-50 border-amber-200 hover:border-amber-300";
  return "bg-slate-50 border-slate-200 hover:border-slate-300";
}

export function getStateTextColorClass(pendingCases: number, maxPending: number): string {
  if (!maxPending) return "text-gray-900";
  const ratio = pendingCases / maxPending;
  
  if (ratio > 0.8) return "text-red-900";
  if (ratio > 0.5) return "text-orange-900";
  if (ratio > 0.2) return "text-amber-900";
  return "text-slate-900";
}
