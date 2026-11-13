
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

import { getTasks, type Task } from "@/api/taskApi";
import { getProjects, type Project } from "@/api/projectApi";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ListTodo,
} from "lucide-react";

type CalendarView = "Month" | "Week" | "Day";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDueDate(value: string): Date {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  return new Date(value);
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear()
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getPriorityStyle(priority?: string) {
  switch (priority) {
    case "High":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "Medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Low":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-white/10";
  }
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>("Month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();

    setCurrentDate(now);
    setToday(now);
    setSelectedDate(now);

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
            : "Unable to load calendar data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const year = currentDate?.getFullYear() ?? 2000;
  const month = currentDate?.getMonth() ?? 0;

  const getTasksForDay = (date: Date) =>
    tasks.filter(
      (task) =>
        task.dueDate &&
        isSameDay(parseDueDate(task.dueDate), date)
    );

  const getProjectName = (projectId: number) =>
    projects.find((project) => project.id === projectId)?.name ||
    "Unknown project";

  const isCompleted = (task: Task) => task.status === "Completed";

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

  const calendarDates = useMemo(() => {
    if (!currentDate) return [];

    if (view === "Day") {
      return [currentDate];
    }

    if (view === "Week") {
      const first = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - currentDate.getDay()
      );

      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(first);
        date.setDate(first.getDate() + index);
        return date;
      });
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => new Date(year, month, index + 1)
      ),
    ];
  }, [currentDate, view, year, month]);

  const selectedDateTasks = selectedDate
    ? getTasksForDay(selectedDate)
    : [];

  const upcomingTasks = useMemo(() => {
    if (!today) return [];

    return tasks
      .filter((task) => {
        if (!task.dueDate || isCompleted(task)) return false;
        return (
          startOfDay(parseDueDate(task.dueDate)).getTime() >=
          startOfDay(today).getTime()
        );
      })
      .sort(
        (a, b) =>
          parseDueDate(a.dueDate!).getTime() -
          parseDueDate(b.dueDate!).getTime()
      );
  }, [tasks, today]);

  const overdueTasks = useMemo(() => {
    if (!today) return [];

    return tasks
      .filter((task) => {
        if (!task.dueDate || isCompleted(task)) return false;
        return (
          startOfDay(parseDueDate(task.dueDate)).getTime() <
          startOfDay(today).getTime()
        );
      })
      .sort(
        (a, b) =>
          parseDueDate(a.dueDate!).getTime() -
          parseDueDate(b.dueDate!).getTime()
      );
  }, [tasks, today]);

  const navigateDate = (direction: number) => {
    if (!currentDate) return;

    const next = new Date(currentDate);

    if (view === "Month") {
      next.setMonth(next.getMonth() + direction);
    } else if (view === "Week") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setDate(next.getDate() + direction);
    }

    setCurrentDate(next);

    if (view !== "Month") {
      setSelectedDate(next);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
    setSelectedDate(now);
  };

  const changeView = (nextView: CalendarView) => {
    setView(nextView);

    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  const heading = () => {
    if (!currentDate) return "";

    if (view === "Day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (view === "Week") {
      const first = new Date(currentDate);
      first.setDate(currentDate.getDate() - currentDate.getDay());

      const last = new Date(first);
      last.setDate(first.getDate() + 6);

      return `${first.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${last.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

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
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
        
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Calendar
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your schedule and keep track of deadlines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-white/[0.08] bg-[#171717] p-1">
              {(["Month", "Week", "Day"] as CalendarView[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeView(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    view === item
                      ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                      : "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar and Side Panels */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.85fr)]">

          {/* Calendar */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#171717] shadow-xl shadow-black/20">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {heading()}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {view === "Month"
                    ? "Your monthly schedule"
                    : view === "Week"
                      ? "Your weekly schedule"
                      : "Your daily schedule"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateDate(-1)}
                  aria-label="Previous period"
                  className="rounded-lg border border-white/10 bg-[#222222] p-2.5 text-zinc-300 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={goToToday}
                  className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-400 transition-all hover:bg-orange-500 hover:text-black"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => navigateDate(1)}
                  aria-label="Next period"
                  className="rounded-lg border border-white/10 bg-[#222222] p-2.5 text-zinc-300 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {view !== "Day" && (
              <div className={`grid border-b border-white/[0.07] ${
                view === "Week" ? "grid-cols-7" : "grid-cols-7"
              }`}>
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 sm:text-xs"
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}

            <div className={`grid ${
              view === "Day" ? "grid-cols-1" : "grid-cols-7"
            }`}>
              {calendarDates.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-24 border-b border-r border-white/[0.05] sm:min-h-28"
                    />
                  );
                }

                const dayTasks = getTasksForDay(date);
                const isToday = today !== null && isSameDay(date, today);
                const isSelected =
                  selectedDate !== null && isSameDay(date, selectedDate);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    aria-pressed={isSelected}
                    className={`group min-h-24 border-b border-r border-white/[0.05] p-2 text-left transition-all duration-200 sm:min-h-28 sm:p-3 ${
                      view === "Day" ? "min-h-48" : ""
                    } ${
                      isSelected
                        ? "bg-orange-500/[0.09] ring-1 ring-inset ring-orange-500/30"
                        : "hover:bg-orange-500/[0.04]"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                          isToday
                            ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                            : isSelected
                              ? "border border-orange-500/50 text-orange-400"
                              : "text-zinc-300 group-hover:bg-orange-500/10 group-hover:text-orange-400"
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-400">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {dayTasks.slice(0, view === "Day" ? 10 : 3).map((task) => (
                        <div
                          key={task.id}
                          title={task.title}
                          className={`truncate rounded-md px-1.5 py-1 text-[9px] font-medium sm:text-[10px] ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {task.title}
                        </div>
                      ))}

                      {dayTasks.length > (view === "Day" ? 10 : 3) && (
                        <p className="px-1 text-[9px] font-semibold text-orange-400">
                          +{dayTasks.length - (view === "Day" ? 10 : 3)} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.07] p-4">
              <span className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                To Do
              </span>
              <span className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                In Progress
              </span>
              <span className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Completed
              </span>
            </div>
          </section>

          {/* Right Side Panels */}
          <div className="space-y-5">

            {/* Upcoming Deadlines */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#171717] p-5 shadow-xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white">Upcoming Deadlines</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Your next deadlines
                  </p>
                </div>
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5">
                  <CalendarDays size={19} className="text-orange-400" />
                </div>
              </div>

              {loading ? (
                <LoadingSpinner message="Loading deadlines..." />
              ) : upcomingTasks.length === 0 ? (
                <EmptyState
                  title="No upcoming deadlines"
                  description="Your upcoming tasks will appear here."
                />
              ) : (
                <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
                  {upcomingTasks.slice(0, 8).map((task) => {
                    const dueDate = parseDueDate(task.dueDate!);
                    const dueToday = today && isSameDay(dueDate, today);

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-white/[0.06] bg-[#1d1d1d] p-3 transition-all hover:border-orange-500/30 hover:bg-[#222222]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-orange-500/10 p-2">
                            <Clock size={15} className="text-orange-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                              {task.title}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-zinc-500">
                              {getProjectName(task.projectId)}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] text-zinc-400">
                                {dueToday
                                  ? "Today"
                                  : dueDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                              </span>
                              <span className={`rounded-md border px-1.5 py-0.5 text-[9px] ${getPriorityStyle(task.priority)}`}>
                                {task.priority || "Normal"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Overdue Tasks */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#171717] p-5 shadow-xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white">Overdue Tasks</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Tasks past their due date
                  </p>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5">
                  <AlertCircle size={19} className="text-red-400" />
                </div>
              </div>

              {loading ? (
                <LoadingSpinner message="Loading overdue tasks..." />
              ) : overdueTasks.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={22} />
                  <p className="text-xs font-semibold text-emerald-400">
                    All caught up!
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    No overdue tasks.
                  </p>
                </div>
              ) : (
                <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                  {overdueTasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-red-500/10 bg-red-500/[0.04] p-3 transition-all hover:border-red-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <Circle size={15} className="mt-0.5 shrink-0 text-red-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white">
                            {task.title}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-zinc-500">
                            {getProjectName(task.projectId)}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-red-400">
                              Due {parseDueDate(task.dueDate!).toLocaleDateString()}
                            </span>
                            <span className={`rounded-md border px-1.5 py-0.5 text-[9px] ${getPriorityStyle(task.priority)}`}>
                              {task.priority || "Normal"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Selected Date Details */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#171717] p-5 shadow-xl shadow-black/20 md:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
                <ListTodo size={21} className="text-orange-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Selected Date"}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedDateTasks.length} scheduled task(s)
                </p>
              </div>
            </div>

            {selectedDate && today && isSameDay(selectedDate, today) && (
              <span className="w-fit rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[10px] font-semibold text-orange-400">
                TODAY
              </span>
            )}
          </div>

          {loading ? (
            <LoadingSpinner message="Loading selected date..." />
          ) : selectedDateTasks.length === 0 ? (
            <EmptyState
              title="No tasks scheduled"
              description="Select another date on the calendar to see its tasks here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-white/[0.07] bg-[#1d1d1d] p-4 transition-all hover:border-orange-500/30 hover:bg-[#222222]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {getProjectName(task.projectId)}
                      </p>
                    </div>
                    {isCompleted(task) ? (
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                    ) : (
                      <Circle size={18} className="shrink-0 text-orange-400" />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} />
                    <span className={`rounded-md border px-2 py-1 text-[10px] ${getPriorityStyle(task.priority)}`}>
                      {task.priority || "Normal"} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
