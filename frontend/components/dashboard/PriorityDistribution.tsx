
"use client";

import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface PriorityItem {
  name: string;
  count: number;
  color: string;
  text: string;
}

interface PriorityDistributionProps {
  loading: boolean;
  priorityData: PriorityItem[];
  totalTasks: number;
}

export default function PriorityDistribution({
  loading,
  priorityData,
  totalTasks,
}: PriorityDistributionProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-bold text-foreground">
          Priority Distribution
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tasks grouped by priority
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading priorities..." />
      ) : totalTasks === 0 ? (
        <EmptyState
          title="No priority data"
          description="Tasks will appear here."
        />
      ) : (
        <div className="space-y-6">
          {priorityData.map((priority) => {
            const percentage = (priority.count / totalTasks) * 100;

            return (
              <div key={priority.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${priority.color}`}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {priority.name}
                    </span>
                  </div>

                  <span className={`text-sm font-bold ${priority.text}`}>
                    {priority.count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${priority.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-7 border-t border-border pt-5">
        <p className="text-sm text-muted-foreground">
          Total tasks
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {loading ? "..." : totalTasks}
        </p>
      </div>
    </div>
  );
}
