
"use client";

import { CalendarDays, Clock } from "lucide-react";

interface DashboardInfoCardsProps {
  completedTasks: number;
  totalTasks: number;
}

export default function DashboardInfoCards({
  completedTasks,
  totalTasks,
}: DashboardInfoCardsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="group flex items-center gap-4 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40">
        <div className="rounded-2xl bg-orange-500 p-4 text-black shadow-lg shadow-orange-500/20 transition-transform group-hover:rotate-6">
          <CalendarDays size={26} />
        </div>

        <div>
          <h3 className="font-bold text-foreground">
            Stay organized
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your projects and deadlines in one place.
          </p>
        </div>
      </div>

      <div className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30">
        <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
          <Clock size={26} />
        </div>

        <div>
          <h3 className="font-bold text-foreground">
            Keep track of progress
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedTasks} tasks completed out of {totalTasks}.
          </p>
        </div>
      </div>
    </div>
  );
}
