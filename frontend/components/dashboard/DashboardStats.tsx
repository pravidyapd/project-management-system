
"use client";

import StatCard from "@/components/common/StatCard";
import type { LucideIcon } from "lucide-react";

interface DashboardStat {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface DashboardStatsProps {
  stats: DashboardStat[];
  loading: boolean;
}

export default function DashboardStats({
  stats,
  loading,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <StatCard
            title={stat.title}
            value={loading ? "..." : stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        </div>
      ))}
    </div>
  );
}
