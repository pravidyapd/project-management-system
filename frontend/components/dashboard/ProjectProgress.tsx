
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProjectProgressItem {
  id: number;
  name: string;
  taskCount: number;
  completed: number;
  percentage: number;
}

interface ProjectProgressProps {
  loading: boolean;
  projects: ProjectProgressItem[];
}

export default function ProjectProgress({
  loading,
  projects,
}: ProjectProgressProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-foreground">
            Project-wise Progress
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Completion percentage for each project
          </p>
        </div>

        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-400"
        >
          View all
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading project progress..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects available"
          description="Create a project to see its progress."
        />
      ) : (
        <div className="space-y-5">
          {projects.slice(0, 6).map((project) => (
            <div key={project.id}>
              <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {project.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.completed} of {project.taskCount} tasks completed
                  </p>
                </div>

                <span className="text-sm font-bold text-emerald-500">
                  {project.percentage}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${project.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
