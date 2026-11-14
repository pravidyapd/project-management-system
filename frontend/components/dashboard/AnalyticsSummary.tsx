
"use client";

import {
  ListTodo,
  Target,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsSummaryProps {
  loading: boolean;
  totalTasks: number;
  completionRate: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export default function AnalyticsSummary({
  loading,
  totalTasks,
  completionRate,
  completedTasks,
  inProgressTasks,
  overdueTasks,
}: AnalyticsSummaryProps) {
  const cards = [
    {
      title: "Tasks in Period",
      value: totalTasks,
      description: "Tasks created in selected period",
      icon: ListTodo,
      color: "text-orange-500",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      description: `${completedTasks} completed tasks`,
      icon: Target,
      color: "text-emerald-500",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      description: "Tasks currently being worked on",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Overdue Tasks",
      value: overdueTasks,
      description: "Uncompleted tasks past their due date",
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {card.title}
              </p>
              <Icon className={card.color} size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold text-foreground">
              {loading ? "..." : card.value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
