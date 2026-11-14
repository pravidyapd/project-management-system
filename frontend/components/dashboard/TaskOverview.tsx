
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface TaskStatus {
  name: string;
  count: number;
  color: string;
  text: string;
  percentage: number;
}

interface TaskOverviewProps {
  loading: boolean;
  totalTasks: number;
  taskStatuses: TaskStatus[];
  progressGradient: string;
}

export default function TaskOverview({
  loading,
  totalTasks,
  taskStatuses,
  progressGradient,
}: TaskOverviewProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5">
      <div className="mb-7">
        <h2 className="text-lg font-bold text-foreground">
          Task Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current task progress
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center">
        <div
          className="relative flex h-40 w-40 items-center justify-center rounded-full p-[10px]"
          style={{ background: progressGradient }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">
                {loading ? "..." : totalTasks}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Total Tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {taskStatuses.map((status) => (
          <div key={status.name}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-muted-foreground">
                {status.name}
              </span>
              <span className={`font-bold ${status.text}`}>
                {loading ? "..." : status.count}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${status.color}`}
                style={{
                  width: `${loading ? 0 : status.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/tasks"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-orange-500/30 py-3 text-sm font-semibold text-orange-500 transition-all hover:bg-orange-500 hover:text-black"
      >
        View All Tasks
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
