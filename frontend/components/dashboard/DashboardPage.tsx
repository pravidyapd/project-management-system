
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";

import {
  getProjects,
  type Project,
} from "@/api/projectApi";

import {
  getTasks,
  type Task,
} from "@/api/taskApi";

import {
  FolderKanban,
  ListTodo,
  CircleCheck,
  Clock,
  ArrowUpRight,
  Plus,
  CalendarDays,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectResult, taskResult] = await Promise.all([
          getProjects(),
          getTasks(),
        ]);

        setProjects(projectResult.data || []);
        setTasks(taskResult.data || []);
      } catch (error) {
        console.error("Dashboard data loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed" || task.status === "Done"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      description: "All registered projects",
      icon: FolderKanban,
      color: "bg-orange-500/10 text-orange-400",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      description: "Currently in progress",
      icon: Activity,
      color: "bg-amber-500/10 text-amber-400",
    },
    {
      title: "Completed Projects",
      value: completedProjects,
      description: "Successfully completed",
      icon: CircleCheck,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      description: "Tasks across projects",
      icon: ListTodo,
      color: "bg-violet-500/10 text-violet-400",
    },
  ];

  const taskTotal = tasks.length || 1;

  const taskStatuses = [
    {
      name: "To Do",
      count: todoTasks,
      color: "bg-orange-500",
      text: "text-orange-400",
      percentage: (todoTasks / taskTotal) * 100,
    },
    {
      name: "In Progress",
      count: inProgressTasks,
      color: "bg-amber-400",
      text: "text-amber-400",
      percentage: (inProgressTasks / taskTotal) * 100,
    },
    {
      name: "Completed",
      count: completedTasks,
      color: "bg-emerald-500",
      text: "text-emerald-400",
      percentage: (completedTasks / taskTotal) * 100,
    },
  ];

  const todoPercentage = (todoTasks / taskTotal) * 100;
  const inProgressPercentage = (inProgressTasks / taskTotal) * 100;
  const completedPercentage = (completedTasks / taskTotal) * 100;

  const todoEnd = todoPercentage;
  const inProgressEnd = todoEnd + inProgressPercentage;
  const completedEnd = inProgressEnd + completedPercentage;

  const progressGradient = tasks.length
    ? `conic-gradient(
        #f97316 0% ${todoEnd}%,
        #fbbf24 ${todoEnd}% ${inProgressEnd}%,
        #10b981 ${inProgressEnd}% ${completedEnd}%,
        rgba(255,255,255,0.07) ${completedEnd}% 100%
      )`
    : "rgba(255,255,255,0.07)";

  return (
    <AppLayout>
      <div className="page-enter mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <PageHeader
            title="Dashboard Overview"
            description="Get a clear view of your projects, tasks, and team progress."
            action={
              <Link
                href="/projects"
                className="orange-button flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={18} />
                New Project
              </Link>
            }
          />
        </div>

        {/* Statistics */}
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

        {/* Main Content */}
        <div className="grid gap-6 xl:grid-cols-3">

          {/* Recent Projects */}
          <section className="rounded-3xl border border-white/[0.07] bg-[#171717] p-6 shadow-xl xl:col-span-2">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Recent Projects
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Your latest project updates
                </p>
              </div>

              <Link
                href="/projects"
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/10"
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
                    className="group flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#1d1d1d] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-[#222222] sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl border border-orange-500/10 bg-orange-500/10 p-3 text-orange-400 transition group-hover:bg-orange-500 group-hover:text-black">
                        <FolderKanban size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-zinc-100">
                          {project.name}
                        </h3>
                        <p className="mt-1 truncate text-xs text-zinc-500">
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

          {/* Task Overview */}
          <section className="rounded-3xl border border-white/[0.07] bg-[#171717] p-6 shadow-xl">
            <div className="mb-7">
              <h2 className="text-lg font-bold text-white">
                Task Overview
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Current task progress
              </p>
            </div>

            {/* Three-color progress circle */}
            <div className="mb-8 flex items-center justify-center">
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full p-[10px]"
                style={{
                  background: progressGradient,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#171717]">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">
                      {loading ? "..." : tasks.length}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Total Tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Task status progress bars */}
            <div className="space-y-6">
              {taskStatuses.map((status) => (
                <div key={status.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-zinc-400">
                      {status.name}
                    </span>
                    <span className={`font-bold ${status.text}`}>
                      {loading ? "..." : status.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
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
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-orange-500/30 py-3 text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500 hover:text-black"
            >
              View All Tasks
              <ArrowUpRight size={17} />
            </Link>
          </section>
        </div>

        {/* Bottom Information Cards */}
        <div className="grid gap-5 md:grid-cols-2">

          <div className="group flex items-center gap-4 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-[#171717] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40">
            <div className="rounded-2xl bg-orange-500 p-4 text-black shadow-lg shadow-orange-500/20 transition-transform group-hover:rotate-6">
              <CalendarDays size={26} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Stay organized
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Manage your projects and deadlines in one place.
              </p>
            </div>
          </div>

          <div className="group flex items-center gap-4 rounded-3xl border border-white/[0.07] bg-[#171717] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30">
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-400 transition-transform group-hover:scale-105">
              <Clock size={26} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Keep track of progress
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {completedTasks} tasks completed out of {tasks.length}.
              </p>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
