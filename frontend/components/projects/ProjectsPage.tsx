
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
        <PageHeader
          title="Projects"
          description="Create, manage and track all your projects."
          action={
            <button
              type="button"
              onClick={() => setShowDialog(true)}
              className="orange-button flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Plus size={19} />
              Add Project
            </button>
          }
        />

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5">

          {/* Table Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                All Projects
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
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
              <thead className="bg-muted">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
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
                      className="transition-colors duration-200 "
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5 text-orange-500">
                            <FolderKanban size={19} />
                          </div>

                          <span className="font-semibold text-foreground">
                            {project.name}
                          </span>
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-5 text-sm text-muted-foreground">
                        {project.description || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={project.status} />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(project)}
                            title="Edit project"
                            aria-label={`Edit ${project.name}`}
                            className="rounded-full border border-border bg-muted p-2.5 text-muted-foreground transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(project.id)}
                            title="Delete project"
                            aria-label={`Delete ${project.name}`}
                            className="rounded-full border border-border bg-muted p-2.5 text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
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
          <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredProjects.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {projects.length}
            </span>{" "}
            projects
          </div>
        </section>

        {/* Add / Edit Modal */}
        <Modal
          open={showDialog}
          title={editingId !== null ? "Edit Project" : "Create New Project"}
          description="Enter your project details below."
          onClose={() => {
            if (!saving) resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Project Name *
              </label>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                className="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Project Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
              >
                <option value="Planning">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-5 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-full border border-border bg-muted px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-50"
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
                  : editingId !== null
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
