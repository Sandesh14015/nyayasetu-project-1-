import { Link } from "wouter";
import { StateStats } from "@workspace/api-client-react";
import { formatCompactNumber, getStateColorClass, getStateTextColorClass } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function StateGrid({ states, loading }: { states?: StateStats[], loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  // Ensure `states` is an array to avoid runtime errors when API returns unexpected shapes.
  const statesArray = Array.isArray(states) ? states : [];

  if (statesArray.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No state data available.</div>;
  }

  const maxPending = Math.max(...statesArray.map(s => s.pendingCases));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {statesArray.sort((a, b) => b.pendingCases - a.pendingCases).map((state, i) => {
        const bgClass = getStateColorClass(state.pendingCases, maxPending);
        const textClass = getStateTextColorClass(state.pendingCases, maxPending);
        
        return (
          <Link key={state.stateCode} href={`/state/${state.stateCode}`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`
                block p-3 rounded-xl border transition-all duration-200 cursor-pointer
                hover:shadow-md hover:-translate-y-1
                ${bgClass}
              `}
            >
              <div className="text-sm font-semibold truncate mb-2 text-foreground" title={state.stateName}>
                {state.stateName}
              </div>
              <div className="flex flex-col gap-1">
                <div className={`text-xl font-bold tracking-tight leading-none ${textClass}`}>
                  {formatCompactNumber(state.pendingCases)}
                </div>
                <div className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground opacity-80">
                  Pending
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
