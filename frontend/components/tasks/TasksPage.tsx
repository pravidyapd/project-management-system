
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import TaskComments from "@/components/tasks/TaskComments";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskPriority,
} from "@/api/taskApi";

import { getProjects, type Project } from "@/api/projectApi";
import { getTeamMembers, type TeamMember } from "@/api/teamApi";

import {
  Plus,
  ListTodo,
  Clock,
  CircleCheck,
  Pencil,
  Trash2,
  CalendarDays,
  FolderKanban,
  MessageSquare,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedCommentTask, setSelectedCommentTask] =
    useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("To Do");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [taskResult, projectResult, teamResult] = await Promise.all([
        getTasks(),
        getProjects(),
        getTeamMembers(),
      ]);

      setTasks(taskResult.data);
      setProjects(projectResult.data);
      setTeamMembers(teamResult.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("To Do");
    setPriority("Medium");
    setAssigneeId("");
    setProjectId("");
    setDueDate("");
    setEditingId(null);
    setShowDialog(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }

    if (!projectId) {
      toast.error("Please select a project.");
      return;
    }

    setSaving(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        projectId: Number(projectId),
        dueDate: dueDate || undefined,
      };

      if (editingId !== null) {
        await updateTask(editingId, taskData);
        toast.success("Task updated successfully!");
      } else {
        await createTask(taskData);
        toast.success("Task created successfully!");
      }

      resetForm();
      await fetchData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save task. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority || "Medium");
    setAssigneeId(task.assigneeId ? String(task.assigneeId) : "");
    setProjectId(String(task.projectId));
    setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : "");
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    setDeleting(true);

    try {
      await deleteTask(deleteId);
      setDeleteId(null);
      toast.success("Task deleted successfully!");
      await fetchData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getProjectName = (id: number) => {
    return projects.find((project) => project.id === id)?.name || "Unknown";
  };

  const getPriorityStyle = (value: string) => {
    switch (value) {
      case "High":
        return "border-red-500/20 bg-red-500/10 text-red-400";
      case "Low":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
      default:
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    }
  };

  const todo = tasks.filter((task) => task.status === "To Do").length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      getProjectName(task.projectId)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (task.assignee?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus = filter === "All" || task.status === filter;

    const matchesPriority =
      priorityFilter === "All" ||
      (task.priority || "Medium") === priorityFilter;

    const matchesAssignee =
      assigneeFilter === "All" ||
      (assigneeFilter === "Unassigned"
        ? !task.assigneeId
        : String(task.assigneeId) === assigneeFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee
    );
  });

  const filterSelectClass =
    "w-full rounded-full border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 sm:w-auto";

  return (
    <AppLayout>
      <div className="page-enter mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <PageHeader
            title="Tasks"
            description="Organize your work and track task progress."
            action={
              <button
                type="button"
                onClick={() => {
                  if (projects.length === 0) {
                    toast.error("Please create a project before adding a task.");
                    return;
                  }
                  setShowDialog(true);
                }}
                disabled={projects.length === 0}
                className="orange-button flex w-full items-center justify-center gap-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={19} />
                Add Task
              </button>
            }
          />
        </div>

        {/* No Projects Message */}
        {projects.length === 0 && !loading && (
          <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-300">
            Please create a project before adding a task.
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={loading ? "..." : tasks.length}
            description="All tasks"
            icon={ListTodo}
            color="bg-orange-500/10 text-orange-400"
          />

          <StatCard
            title="To Do"
            value={loading ? "..." : todo}
            description="Tasks waiting to start"
            icon={Clock}
            color="bg-amber-500/10 text-amber-400"
          />

          <StatCard
            title="In Progress"
            value={loading ? "..." : inProgress}
            description="Currently working"
            icon={FolderKanban}
            color="bg-blue-500/10 text-blue-400"
          />

          <StatCard
            title="Completed"
            value={loading ? "..." : completed}
            description="Finished tasks"
            icon={CircleCheck}
            color="bg-emerald-500/10 text-emerald-400"
          />
        </div>

        {/* Tasks Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-xl shadow-black/10">
          {/* Table Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 lg:p-6">
            <div>
              <h2 className="text-lg font-bold text-white">All Tasks</h2>
              <p className="mt-1 text-sm text-zinc-400">
                View and manage your tasks.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search tasks..."
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={filterSelectClass}
              >
                <option value="All">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={filterSelectClass}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className={filterSelectClass}
              >
                <option value="All">All Assignees</option>
                <option value="Unassigned">Unassigned</option>

                {teamMembers.map((member) => (
                  <option key={member.id} value={String(member.id)}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-[#202020]">
                <tr className="text-xs uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Assignee</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8">
                      <LoadingSpinner message="Loading tasks..." />
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6">
                      <EmptyState
                        title="No tasks found"
                        description="Add a task or change your search and filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="transition-colors duration-200 hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {task.description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-300">
                        {getProjectName(task.projectId)}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                            task.priority || "Medium"
                          )}`}
                        >
                          {task.priority || "Medium"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-300">
                        {task.assignee?.name || (
                          <span className="text-zinc-500">Unassigned</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-400">
                        <span className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="text-orange-400"
                          />
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={task.status} />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCommentTask(task)}
                            title="View comments"
                            aria-label={`View comments for ${task.title}`}
                            className="rounded-full border border-white/10 bg-zinc-800 p-2.5 text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                          >
                            <MessageSquare size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(task)}
                            title="Edit task"
                            aria-label={`Edit ${task.title}`}
                            className="rounded-full border border-white/10 bg-zinc-800 p-2.5 text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(task.id)}
                            title="Delete task"
                            aria-label={`Delete ${task.title}`}
                            className="rounded-full border border-white/10 bg-zinc-800 p-2.5 text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-white/10 px-6 py-4 text-sm text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredTasks.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">{tasks.length}</span>{" "}
            tasks
          </div>
        </div>

        {/* Add / Edit Modal */}
        <Modal
          open={showDialog}
          title={editingId ? "Edit Task" : "Create New Task"}
          description="Enter your task details below."
          onClose={() => {
            if (!saving) resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                Task Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                Select Project *
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as TaskPriority)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                  Assign To
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>

                {teamMembers.length === 0 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Add team members to assign tasks.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#202020] px-3 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-full border border-white/10 bg-zinc-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !title.trim() || !projectId}
                className="orange-button flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Task"
                    : "Create Task"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Task Comments */}
        {selectedCommentTask && (
          <TaskComments
            taskId={selectedCommentTask.id}
            taskTitle={selectedCommentTask.title}
            onClose={() => setSelectedCommentTask(null)}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteId !== null}
          title="Delete Task?"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => {
            if (!deleting) setDeleteId(null);
          }}
          loading={deleting}
        />
      </div>
    </AppLayout>
  );
}
