
import type { Task } from "@/api/taskApi";
import type { Project } from "@/api/projectApi";

export type DateRange = "7days" | "30days" | "3months" | "all";

export interface TrendItem {
  label: string;
  count: number;
}

export interface PriorityItem {
  name: string;
  count: number;
  color: string;
  text: string;
}

export interface ProjectProgressItem extends Project {
  taskCount: number;
  completed: number;
  percentage: number;
}

export interface TaskStatusItem {
  name: string;
  count: number;
  color: string;
  text: string;
  percentage: number;
}

// Check completed task status
export const isCompleted = (status: string) =>
  status === "Completed" || status === "Done";

// Get starting date for selected range
export const getDateRangeStart = (range: DateRange) => {
  const date = new Date();

  switch (range) {
    case "7days":
      date.setDate(date.getDate() - 6);
      break;

    case "30days":
      date.setDate(date.getDate() - 29);
      break;

    case "3months":
      date.setMonth(date.getMonth() - 3);
      break;

    default:
      return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

// Filter tasks based on selected date range
export const filterTasksByDateRange = (
  tasks: Task[],
  range: DateRange
): Task[] => {
  const start = getDateRangeStart(range);

  if (!start) return tasks;

  return tasks.filter((task) => {
    if (!task.createdAt) return false;

    const created = new Date(task.createdAt);

    return (
      !Number.isNaN(created.getTime()) &&
      created >= start
    );
  });
};

// Get overdue tasks
export const getOverdueTasks = (
  tasks: Task[],
  referenceDate = new Date()
): Task[] => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (!task.dueDate || isCompleted(task.status)) {
      return false;
    }

    const dueDate = new Date(task.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  });
};

// Build task creation trend
export const buildTrend = (
  tasks: Task[],
  range: DateRange
): TrendItem[] => {
  const now = new Date();
  const rangeStart = getDateRangeStart(range);

  const bucketCount = 7;
  let interval: number;

  if (range === "7days") {
    interval = 24 * 60 * 60 * 1000;
  } else if (range === "30days") {
    interval = 5 * 24 * 60 * 60 * 1000;
  } else if (range === "3months") {
    interval = 13 * 24 * 60 * 60 * 1000;
  } else {
    interval = 30 * 24 * 60 * 60 * 1000;
  }

  let start = rangeStart;

  if (!start) {
    const datedTasks = tasks
      .filter((task) => task.createdAt)
      .map((task) => new Date(task.createdAt!).getTime())
      .filter((time) => !Number.isNaN(time));

    if (datedTasks.length > 0) {
      const earliest = Math.min(...datedTasks);

      start = new Date(
        Math.min(earliest, now.getTime() - interval * 6)
      );
    } else {
      start = new Date(now.getTime() - interval * 6);
    }
  }

  const trend: TrendItem[] = Array.from(
    { length: bucketCount },
    (_, index) => {
      const bucketDate = new Date(
        start!.getTime() + interval * index
      );

      return {
        label:
          range === "7days"
            ? bucketDate.toLocaleDateString("en", {
                weekday: "short",
              })
            : range === "all"
              ? bucketDate.toLocaleDateString("en", {
                  month: "short",
                })
              : bucketDate.toLocaleDateString("en", {
                  day: "numeric",
                  month: "short",
                }),
        count: 0,
      };
    }
  );

  tasks.forEach((task) => {
    if (!task.createdAt) return;

    const created = new Date(task.createdAt);

    if (Number.isNaN(created.getTime())) return;

    const index = Math.floor(
      (created.getTime() - start!.getTime()) / interval
    );

    if (index >= 0 && index < bucketCount) {
      trend[index].count++;
    }
  });

  return trend;
};

// Get priority distribution
export const getPriorityData = (
  tasks: Task[]
): PriorityItem[] => [
  {
    name: "High",
    count: tasks.filter((task) => task.priority === "High").length,
    color: "bg-red-500",
    text: "text-red-500",
  },
  {
    name: "Medium",
    count: tasks.filter((task) => task.priority === "Medium").length,
    color: "bg-amber-500",
    text: "text-amber-500",
  },
  {
    name: "Low",
    count: tasks.filter((task) => task.priority === "Low").length,
    color: "bg-emerald-500",
    text: "text-emerald-500",
  },
];

// Get project-wise progress
export const getProjectProgress = (
  projects: Project[],
  tasks: Task[]
): ProjectProgressItem[] => {
  return projects
    .map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id
      );

      const completed = projectTasks.filter((task) =>
        isCompleted(task.status)
      ).length;

      return {
        ...project,
        taskCount: projectTasks.length,
        completed,
        percentage: projectTasks.length
          ? Math.round(
              (completed / projectTasks.length) * 100
            )
          : 0,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
};

// Get task status distribution
export const getTaskStatuses = (
  tasks: Task[]
): TaskStatusItem[] => {
  const total = tasks.length || 1;

  const todo = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completed = tasks.filter((task) =>
    isCompleted(task.status)
  ).length;

  return [
    {
      name: "To Do",
      count: todo,
      color: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      percentage: (todo / total) * 100,
    },
    {
      name: "In Progress",
      count: inProgress,
      color: "bg-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      percentage: (inProgress / total) * 100,
    },
    {
      name: "Completed",
      count: completed,
      color: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      percentage: (completed / total) * 100,
    },
  ];
};

// Generate task overview donut chart gradient
export const getProgressGradient = (
  tasks: Task[]
): string => {
  if (!tasks.length) {
    return "rgba(128,128,128,0.18)";
  }

  const statuses = getTaskStatuses(tasks);

  const todoEnd = statuses[0].percentage;
  const inProgressEnd =
    todoEnd + statuses[1].percentage;

  const completedEnd =
    inProgressEnd + statuses[2].percentage;

  return `conic-gradient(
    #f97316 0% ${todoEnd}%,
    #fbbf24 ${todoEnd}% ${inProgressEnd}%,
    #10b981 ${inProgressEnd}% ${completedEnd}%,
    rgba(128,128,128,0.18) ${completedEnd}% 100%
  )`;
};
