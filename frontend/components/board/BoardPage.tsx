
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/common/PageHeader";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";

import {
  getTasks,
  updateTask,
  type Task,
} from "@/api/taskApi";

import {
  getProjects,
  type Project,
} from "@/api/projectApi";

import {
  CalendarDays,
  LayoutGrid,
  Clock,
  CheckCircle2,
  Circle,
  GripVertical,
} from "lucide-react";

const columns = [
  {
    title: "To Do",
    icon: Circle,
    iconColor: "text-orange-400",
    countColor: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    dropColor: "border-orange-500/40 bg-orange-500/[0.06]",
    cardBorder: "border-l-orange-500",
    labelColor: "text-orange-400",
  },
  {
    title: "In Progress",
    icon: Clock,
    iconColor: "text-blue-400",
    countColor: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    dropColor: "border-blue-500/40 bg-blue-500/[0.06]",
    cardBorder: "border-l-blue-500",
    labelColor: "text-blue-400",
  },
  {
    title: "Completed",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    countColor: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    dropColor: "border-emerald-500/40 bg-emerald-500/[0.06]",
    cardBorder: "border-l-emerald-500",
    labelColor: "text-emerald-400",
  },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [taskResult, projectResult] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);

        setTasks(taskResult.data || []);
        setProjects(projectResult.data || []);
      } catch (error) {
        console.error("Failed to load board data:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load board data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getProjectName = (projectId: number) => {
    return (
      projects.find((project) => project.id === projectId)?.name ||
      "Unknown project"
    );
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    taskId: number
  ) => {
    setDraggedTaskId(taskId);
    event.dataTransfer.setData("text/plain", String(taskId));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    columnTitle: string
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnTitle);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    newStatus: string
  ) => {
    event.preventDefault();

    const taskId = Number(event.dataTransfer.getData("text/plain"));

    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (!taskId) return;

    const draggedTask = tasks.find((task) => task.id === taskId);

    if (!draggedTask || draggedTask.status === newStatus) return;

    const previousTasks = [...tasks];

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );

    try {
      await updateTask(taskId, {
        status: newStatus,
      });

      toast.success(`Task moved to ${newStatus}!`);
    } catch (error) {
      console.error("Failed to update task:", error);
      setTasks(previousTasks);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to move task. Please try again."
      );
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <PageHeader
          title="Task Board"
          description="Drag and drop tasks between columns."
        />

        {/* Board Information */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <LayoutGrid size={17} className="text-orange-400" />
            <span>Workspace Board</span>
            <span className="text-zinc-600">/</span>
            <span className="font-semibold text-white">
              {tasks.length} Tasks
            </span>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tasks..."
          />
        </div>

        {/* Board */}
        {loading ? (
          <LoadingSpinner message="Loading board tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks available"
            description="Create some tasks to see them on your board."
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">

            {columns.map((column) => {
              const Icon = column.icon;

              const columnTasks = filteredTasks.filter(
                (task) => task.status === column.title
              );

              const isDragOver = dragOverColumn === column.title;

              return (
                <div
                  key={column.title}
                  className="flex min-w-0 flex-col"
                >

                  {/* Column Header */}
                  <div className="mb-4 flex items-center rounded-xl border border-white/10 bg-[#171717] px-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#222222]">
                      <Icon
                        size={20}
                        className={column.iconColor}
                      />
                    </div>

                    <h2 className="ml-3 font-semibold text-white">
                      {column.title}
                    </h2>

                    <span
                      className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold ${column.countColor}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Drop Area */}
                  <div
                    onDragOver={(event) =>
                      handleDragOver(event, column.title)
                    }
                    onDrop={(event) =>
                      handleDrop(event, column.title)
                    }
                    onDragLeave={() => setDragOverColumn(null)}
                    className={`flex-1 min-h-[450px] space-y-3 rounded-2xl border p-3 ${
                      isDragOver
                        ? column.dropColor
                        : "border-white/[0.06] bg-[#111111]"
                    }`}
                  >
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, task.id)
                        }
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverColumn(null);
                        }}
                        className={`flex min-h-[190px] w-full cursor-grab flex-col select-none rounded-xl border border-white/[0.07] border-l-[3px] bg-[#1b1b1b] p-4 shadow-sm active:cursor-grabbing ${
                          column.cardBorder
                        } ${
                          draggedTaskId === task.id
                            ? "opacity-40"
                            : "opacity-100"
                        }`}
                      >
                        {/* Task Title */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 flex-1 break-words font-semibold leading-snug text-white">
                            {task.title}
                          </h3>

                          <GripVertical
                            size={20}
                            className="shrink-0 text-zinc-500"
                          />
                        </div>

                        {/* Description */}
                        <p className="mt-3 min-h-[40px] line-clamp-2 text-sm leading-relaxed text-zinc-400">
                          {task.description ||
                            "No description provided"}
                        </p>

                        {/* Project */}
                        <div className="mt-auto rounded-lg border border-white/[0.07] bg-[#222222] px-3 py-2 text-xs font-medium text-zinc-300">
                          {getProjectName(task.projectId)}
                        </div>

                        {/* Status */}
                        <div className="mt-3">
                          <span
                            className={`text-xs font-semibold ${column.labelColor}`}
                          >
                            {column.title}
                          </span>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                            <CalendarDays
                              size={14}
                              className="text-zinc-500"
                            />

                            Due{" "}
                            {new Date(
                              task.dueDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty Column */}
                    {columnTasks.length === 0 && (
                      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-zinc-500">
                          <Icon size={19} />
                        </div>

                        <p className="text-sm font-medium text-zinc-400">
                          {search
                            ? "No matching tasks"
                            : "Drop tasks here"}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {search
                            ? "Try a different search"
                            : "Drag a task into this column"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
