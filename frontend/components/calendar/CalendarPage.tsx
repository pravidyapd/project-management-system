
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

import {
  getTasks,
  type Task,
} from "@/api/taskApi";

import {
  getProjects,
  type Project,
} from "@/api/projectApi";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
} from "lucide-react";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();

    setCurrentDate(now);
    setToday(now);

    const fetchData = async () => {
      try {
        const [taskResult, projectResult] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);

        setTasks(taskResult.data || []);
        setProjects(projectResult.data || []);
      } catch (error) {
        console.error("Failed to load calendar data:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load calendar data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const year = currentDate?.getFullYear() ?? 2000;
  const month = currentDate?.getMonth() ?? 0;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const previousMonth = () => {
    if (!currentDate) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    if (!currentDate) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      const date = new Date(task.dueDate);

      return (
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "border-l-2 border-emerald-500 bg-emerald-500/10 text-emerald-400";

      case "In Progress":
        return "border-l-2 border-blue-500 bg-blue-500/10 text-blue-400";

      default:
        return "border-l-2 border-orange-500 bg-orange-500/10 text-orange-400";
    }
  };

  const getProjectName = (projectId: number) => {
    return (
      projects.find((project) => project.id === projectId)?.name ||
      "Unknown project"
    );
  };

  const upcomingTasks = tasks
    .filter((task) => task.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate!).getTime() -
        new Date(b.dueDate!).getTime()
    );

  if (!currentDate) {
    return (
      <AppLayout>
        <LoadingSpinner message="Loading calendar..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-orange-400">
            WORKSPACE / CALENDAR
          </p>

          <PageHeader
            title="Calendar"
            description="View your tasks and deadlines in one place."
          />
        </div>

        {/* Calendar */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#171717] p-4 shadow-xl shadow-black/20 md:p-6">

          {/* Calendar Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Your monthly task schedule
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previousMonth}
                aria-label="Previous month"
                className="rounded-full border border-white/10 bg-[#222222] p-2.5 text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
              >
                Today
              </button>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="rounded-full border border-white/10 bg-[#222222] p-2.5 text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekdays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-zinc-400 md:text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayTasks = day ? getTasksForDay(day) : [];

              const isToday =
                today !== null &&
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  key={index}
                  className="min-h-24 border-b border-r border-white/[0.06] p-1.5 transition-colors hover:bg-white/[0.02] md:min-h-32 md:p-2"
                >
                  {day && (
                    <>
                      <div className="mb-2">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs md:text-sm ${
                            isToday
                              ? "bg-orange-500 font-bold text-black"
                              : "font-medium text-zinc-300"
                          }`}
                        >
                          {day}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            title={task.title}
                            className={`truncate rounded-md px-1.5 py-1 text-[10px] font-medium md:text-xs ${getStatusStyle(
                              task.status
                            )}`}
                          >
                            {task.title}
                          </div>
                        ))}

                        {dayTasks.length > 3 && (
                          <p className="px-1 text-[10px] font-medium text-orange-400">
                            +{dayTasks.length - 3} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-5 border-t border-white/[0.06] pt-5 text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
              To Do
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              In Progress
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              Completed
            </span>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#171717] p-5 shadow-xl shadow-black/20 md:p-6">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Upcoming Deadlines
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Tasks with due dates
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
              <CalendarDays className="text-orange-400" size={22} />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading deadlines..." />
          ) : upcomingTasks.length === 0 ? (
            <EmptyState
              title="No upcoming deadlines"
              description="Tasks with due dates will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#1d1d1d] p-4 transition-colors hover:border-orange-500/20 hover:bg-[#222222] sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                      <Clock className="text-orange-400" size={19} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-400">
                        {getProjectName(task.projectId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={task.status} />

                    <span className="text-xs font-medium text-zinc-400">
                      {new Date(task.dueDate!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
