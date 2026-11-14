
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  type TeamMember,
} from "@/api/teamApi";

import {
  Users,
  Plus,
  Mail,
  Pencil,
  Trash2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchMembers() {
    try {
      setLoading(true);
      setError("");

      const result = await getTeamMembers();
      setMembers(result.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email} ${member.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openAddModal() {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Developer");
    setError("");
    setShowModal(true);
  }

  function openEditModal(member: TeamMember) {
    setEditingId(member.id);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter the member's name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const memberData = {
        name: name.trim(),
        email: email.trim(),
        role,
      };

      if (editingId !== null) {
        await updateTeamMember(editingId, memberData);
        toast.success("Team member updated successfully!");
      } else {
        await createTeamMember(memberData);
        toast.success("Team member added successfully!");
      }

      setShowModal(false);
      setEditingId(null);

      await fetchMembers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember() {
    if (deleteId === null) return;

    try {
      setDeleting(true);
      setError("");

      await deleteTeamMember(deleteId);

      setDeleteId(null);
      toast.success("Team member deleted successfully!");

      await fetchMembers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  }

  const adminCount = members.filter(
    (member) => member.role === "Admin"
  ).length;

  const otherCount = members.length - adminCount;

  return (
    <AppLayout>
      <div className="page-enter mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <PageHeader
          title="Team Members"
          description="Manage the people working on your projects."
          action={
            <button
              type="button"
              onClick={openAddModal}
              className="orange-button flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Plus size={19} />
              Add Member
            </button>
          }
        />

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Members"
            value={loading ? "..." : members.length}
            description="People in workspace"
            icon={Users}
            color="bg-orange-500/10 text-orange-500"
          />

          <StatCard
            title="Administrators"
            value={loading ? "..." : adminCount}
            description="Workspace admins"
            icon={ShieldCheck}
            color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />

          <StatCard
            title="Other Members"
            value={loading ? "..." : otherCount}
            description="Developers and designers"
            icon={UserRound}
            color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
        </div>

        {/* Team Members Table */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5">

          {/* Table Header */}
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                All Members
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                View and manage your workspace members.
              </p>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search members..."
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Member</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8">
                      <LoadingSpinner message="Loading team members..." />
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6">
                      <EmptyState
                        title="No members found"
                        description="Try another search or add a new member."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className=""
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 font-bold text-orange-500">
                            {member.name.charAt(0).toUpperCase()}
                          </div>

                          <span className="font-semibold text-foreground">
                            {member.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Mail size={15} className="text-orange-500" />
                          {member.email}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-500">
                          {member.role}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            aria-label={`Edit ${member.name}`}
                            className="rounded-full border cursor-pointer border-border bg-muted p-2.5 text-muted-foreground transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(member.id)}
                            aria-label={`Delete ${member.name}`}
                            className="rounded-full cursor-pointer border border-border bg-muted p-2.5 text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
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
              {filteredMembers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {members.length}
            </span>{" "}
            members
          </div>
        </section>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        title={editingId !== null ? "Edit Member" : "Add Team Member"}
        description="Enter the member details below."
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Full Name
            </label>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Email Address
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
            >
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Tester">Tester</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-5 sm:flex-row">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="rounded-full border border-border bg-muted px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="orange-button disabled:cursor-not-allowed disabled:opacity-50 "
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Save Changes"
                : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Team Member?"
        message="Are you sure you want to delete this team member? This action cannot be undone."
        onConfirm={deleteMember}
        onCancel={() => {
          if (!deleting) setDeleteId(null);
        }}
        loading={deleting}
      />
    </AppLayout>
  );
}
