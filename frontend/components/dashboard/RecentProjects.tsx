
"use client";

import Link from "next/link";
import { ArrowUpRight, FolderKanban } from "lucide-react";

import type { Project } from "@/api/projectApi";

import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface RecentProjectsProps {
  projects: Project[];
  loading: boolean;
}

export default function RecentProjects({
  projects,
  loading,
}: RecentProjectsProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 xl:col-span-2">
      <div className="mb-7 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Recent Projects
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your latest project updates
          </p>
        </div>

        <Link
          href="/projects"
          className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-500/10"
        >
          View all
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started."
        />
      ) : (
        <div className="space-y-3">
          {projects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between gap-3 rounded-2xl border border-border bg-muted p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-accent sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl border border-orange-500/10 bg-orange-500/10 p-3 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-black">
                  <FolderKanban size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-foreground">
                    {project.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {project.description || "No description"}
                  </p>
                </div>
              </div>

              <StatusBadge status={project.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
