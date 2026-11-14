
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AppLayout from "@/components/layout/AppLayout";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "@/api/projectApi";

import {
  Plus,
  FolderKanban,
  CircleCheck,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const result = await getProjects();
      setProjects(result.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("Planning");
    setEditingId(null);
    setShowDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a project name.");
      return;
    }

    setSaving(true);

    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        status,
      };

      if (editingId !== null) {
        await updateProject(editingId, projectData);
        toast.success("Project updated successfully!");
      } else {
        await createProject(projectData);
        toast.success("Project created successfully!");
      }

      resetForm();
      await fetchProjects();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save project. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setStatus(project.status);
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    setDeleting(true);

    try {
      await deleteProject(deleteId);
      setDeleteId(null);
      toast.success("Project deleted successfully!");
      await fetchProjects();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete project."
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const completed = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const active = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  return (
    <AppLayout>
      <div className="page-enter mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <div className="mb-8">
          <PageHeader
            title="Projects"
            description="Create, manage and track all your projects."
            action={
              <button
                onClick={() => setShowDialog(true)}
                className="orange-button flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <Plus size={19} />
                Add Project
              </button>
            }
          />
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Projects"
            value={loading ? "..." : projects.length}
            description="All registered projects"
            icon={FolderKanban}
            color="bg-orange-500/10 text-orange-500 dark:text-orange-400"
          />

          <StatCard
            title="Active Projects"
            value={loading ? "..." : active}
            description="Currently in progress"
            icon={Clock}
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />

          <StatCard
            title="Completed Projects"
            value={loading ? "..." : completed}
            description="Successfully completed"
            icon={CircleCheck}
            color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Projects Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 dark:border-white/10 dark:bg-[#171717] dark:shadow-black/10">

          {/* Table Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                All Projects
              </h2>

              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Manage your project information.
              </p>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search projects..."
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-zinc-100 dark:bg-[#202020]">
                <tr className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                {loading ? (
                  <tr>
                    <td colSpan={4}>
                      <LoadingSpinner message="Loading projects..." />
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        title="No projects found"
                        description="Try another search or add a new project."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-400">
                            <FolderKanban size={19} />
                          </div>

                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {project.name}
                          </span>
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-5 text-sm text-zinc-600 dark:text-zinc-400">
                        {project.description || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={project.status} />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            title="Edit project"
                            aria-label={`Edit ${project.name}`}
                            className="rounded-full border border-zinc-200 bg-zinc-100 p-2.5 text-zinc-700 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-600 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-orange-400"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => setDeleteId(project.id)}
                            title="Delete project"
                            aria-label={`Delete ${project.name}`}
                            className="rounded-full border border-zinc-200 bg-zinc-100 p-2.5 text-zinc-700 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-red-400"
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
          <div className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {filteredProjects.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {projects.length}
            </span>{" "}
            projects
          </div>
        </div>

        {/* Add / Edit Modal */}
        <Modal
          open={showDialog}
          title={editingId ? "Edit Project" : "Create New Project"}
          description="Enter your project details below."
          onClose={() => {
            if (!saving) resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Project Name *
              </label>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-white/10 dark:bg-[#202020] dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-white/10 dark:bg-[#202020] dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Project Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-white/10 dark:bg-[#202020] dark:text-white"
              >
                <option value="Planning">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t border-zinc-200 pt-5 sm:flex-row dark:border-white/10">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-full border border-zinc-300 bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-200 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="orange-button flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Project"
                    : "Create Project"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteId !== null}
          title="Delete Project?"
          message="Are you sure you want to delete this project? This action cannot be undone."
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
