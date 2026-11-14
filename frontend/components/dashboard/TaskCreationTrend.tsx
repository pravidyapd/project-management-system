
"use client";

import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface TrendItem {
  label: string;
  count: number;
}

interface TaskCreationTrendProps {
  loading: boolean;
  trendData: TrendItem[];
  maxTrendCount: number;
}

export default function TaskCreationTrend({
  loading,
  trendData,
  maxTrendCount,
}: TaskCreationTrendProps) {
  const hasTasks = trendData.some((item) => item.count > 0);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 xl:col-span-2">
      <div className="mb-6">
        <h3 className="font-bold text-foreground">
          Task Creation Trend
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Number of tasks created over time
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : !hasTasks ? (
        <EmptyState
          title="No task activity"
          description="No tasks were created during this period."
        />
      ) : (
        <div className="flex h-56 items-end gap-2 sm:gap-4">
          {trendData.map((item, index) => {
            const height = item.count
              ? Math.max(
                  (item.count / Math.max(maxTrendCount, 1)) * 100,
                  5
                )
              : 0;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {item.count || ""}
                </span>

                <div className="flex h-full w-full items-end overflow-hidden rounded-t-lg bg-muted">
                  <div
                    className="w-full rounded-t-lg bg-blue-500 transition-all duration-700 hover:bg-orange-400"
                    style={{ height: `${height}%` }}
                    title={`${item.count} tasks created`}
                  />
                </div>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
