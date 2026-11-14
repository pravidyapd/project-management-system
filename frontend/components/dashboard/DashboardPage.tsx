
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/common/PageHeader";

import DashboardStats from "@/components/dashboard/DashboardStats";
import AnalyticsSummary from "@/components/dashboard/AnalyticsSummary";
import TaskCreationTrend from "@/components/dashboard/TaskCreationTrend";
import PriorityDistribution from "@/components/dashboard/PriorityDistribution";
import ProjectProgress from "@/components/dashboard/ProjectProgress";
import RecentProjects from "@/components/dashboard/RecentProjects";
import TaskOverview from "@/components/dashboard/TaskOverview";
import DashboardInfoCards from "@/components/dashboard/DashboardInfoCards";
import ReportsAnalytics from "@/components/dashboard/ReportsAnalytics";

import { getProjects, type Project } from "@/api/projectApi";
import { getTasks, type Task } from "@/api/taskApi";

import {
  exportReportCSV,
  exportReportPDF,
} from "@/lib/reportExport";

import {
  FolderKanban,
  ListTodo,
  CircleCheck,
  Activity,
  Plus,
} from "lucide-react";

import {
  type DateRange,
  filterTasksByDateRange,
  isCompleted,
  getOverdueTasks,
  buildTrend,
  getPriorityData,
  getProjectProgress,
  getTaskStatuses,
  getProgressGradient,
} from "@/utils/dashboardUtils";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] =
    useState<DateRange>("30days");

  // Fetch dashboard data
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
        console.error(
          "Dashboard data loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Overall project statistics
  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  // Overall task statistics
  const completedTasks = tasks.filter((task) =>
    isCompleted(task.status)
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  // Filter report tasks
  const reportTasks = useMemo(
    () => filterTasksByDateRange(tasks, dateRange),
    [tasks, dateRange]
  );

  // Report statistics
  const reportCompleted = reportTasks.filter((task) =>
    isCompleted(task.status)
  ).length;

  const reportInProgress = reportTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const reportOverdue = getOverdueTasks(reportTasks).length;

  const completionRate = reportTasks.length
    ? Math.round(
        (reportCompleted / reportTasks.length) * 100
      )
    : 0;

  // Export reports
  const reportSummary = {
    totalTasks: reportTasks.length,
    completedTasks: reportCompleted,
    inProgressTasks: reportInProgress,
    overdueTasks: reportOverdue,
    completionRate,
  };

  const handleExportCSV = () => {
    exportReportCSV(
      reportTasks,
      projects,
      reportSummary
    );
  };

  const handleExportPDF = () => {
    exportReportPDF(
      reportTasks,
      projects,
      reportSummary
    );
  };

  // Analytics calculations
  const priorityData = useMemo(
    () => getPriorityData(reportTasks),
    [reportTasks]
  );

  const trendData = useMemo(
    () => buildTrend(reportTasks, dateRange),
    [reportTasks, dateRange]
  );

  const maxTrendCount = Math.max(
    ...trendData.map((item) => item.count),
    1
  );

  const projectProgress = useMemo(
    () => getProjectProgress(projects, reportTasks),
    [projects, reportTasks]
  );

  // Main dashboard statistics
  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      description: "All registered projects",
      icon: FolderKanban,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      description: "Currently in progress",
      icon: Activity,
      color:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Completed Projects",
      value: completedProjects,
      description: "Successfully completed",
      icon: CircleCheck,
      color:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      description: "Tasks across projects",
      icon: ListTodo,
      color:
        "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  // Task overview
  const taskStatuses = useMemo(
    () => getTaskStatuses(tasks),
    [tasks]
  );

  const progressGradient = useMemo(
    () => getProgressGradient(tasks),
    [tasks]
  );

  return (
    <AppLayout>
      <div className="page-enter mx-auto max-w-7xl space-y-8">

        {/* Header */}
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

        {/* Main Statistics */}
        <DashboardStats
          stats={stats}
          loading={loading}
        />

        {/* Reports and Analytics */}
        <section className="space-y-6">

          <ReportsAnalytics
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            loading={loading}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />

          <AnalyticsSummary
            loading={loading}
            totalTasks={reportTasks.length}
            completionRate={completionRate}
            completedTasks={reportCompleted}
            inProgressTasks={reportInProgress}
            overdueTasks={reportOverdue}
          />

          {/* Task Creation Trend and Priority */}
          <div className="grid gap-6 xl:grid-cols-3">

            <TaskCreationTrend
              loading={loading}
              trendData={trendData}
              maxTrendCount={maxTrendCount}
            />

            <PriorityDistribution
              loading={loading}
              priorityData={priorityData}
              totalTasks={reportTasks.length}
            />

          </div>

          {/* Project Progress */}
          <ProjectProgress
            loading={loading}
            projects={projectProgress}
          />

        </section>

        {/* Recent Projects and Task Overview */}
        <div className="grid gap-6 xl:grid-cols-3">

          <RecentProjects
            projects={projects}
            loading={loading}
          />

          <TaskOverview
            loading={loading}
            totalTasks={tasks.length}
            taskStatuses={taskStatuses}
            progressGradient={progressGradient}
          />

        </div>

        {/* Bottom Information Cards */}
        <DashboardInfoCards
          completedTasks={completedTasks}
          totalTasks={tasks.length}
        />

      </div>
    </AppLayout>
  );
}
