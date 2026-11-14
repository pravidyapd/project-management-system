
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification as deleteNotificationRequest,
  type Notification,
} from "@/api/notificationApi";

import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  FolderKanban,
  CheckSquare,
  Clock,
  Info,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const result = await getNotifications();
      setNotifications(result.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      setError(errorMessage);

      if (showLoading) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && !notification.read) ||
        (filter === "Read" && notification.read);

      const matchesSearch =
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.description.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      toast.success("Notification marked as read!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to mark notification as read."
      );
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);

    if (unread.length === 0) {
      toast.info("All notifications are already read.");
      return;
    }

    try {
      setMarkingAll(true);

      const results = await Promise.allSettled(
        unread.map((notification) =>
          markNotificationAsRead(notification.id)
        )
      );

      const successfulIds = unread
        .filter((_, index) => results[index].status === "fulfilled")
        .map((notification) => notification.id);

      const failedCount = results.length - successfulIds.length;

      if (successfulIds.length > 0) {
        setNotifications((previous) =>
          previous.map((notification) =>
            successfulIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );
      }

      if (failedCount === 0) {
        toast.success("All notifications marked as read!");
      } else if (successfulIds.length > 0) {
        toast.warning(
          `${successfulIds.length} notifications marked as read. ${failedCount} failed.`
        );
      } else {
        toast.error("Unable to mark notifications as read.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (deleteId === null) return;

    try {
      setDeleting(true);

      await deleteNotificationRequest(deleteId);

      setNotifications((previous) =>
        previous.filter((n) => n.id !== deleteId)
      );

      setDeleteId(null);
      toast.success("Notification deleted successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete notification."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "task":
        return <CheckSquare size={20} />;
      case "project":
        return <FolderKanban size={20} />;
      case "reminder":
        return <Clock size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getIconStyle = (type: Notification["type"]) => {
    switch (type) {
      case "task":
        return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "project":
        return "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "reminder":
        return "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400";
      default:
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }
  };

  const formatTime = (date: string) => {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Unknown date";
    }

    return value.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <PageHeader
          title="Notifications"
          description="Stay updated with your projects and tasks."
          action={
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fetchNotifications(true)}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-orange-500/40 hover:bg-accent hover:text-orange-500"
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0 || markingAll}
                className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={17} />
                {markingAll ? "Marking..." : "Mark all read"}
              </button>
            </div>
          }
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Notifications"
            value={notifications.length}
            icon={Bell}
            color="bg-orange-500/10 text-orange-500"
          />

          <StatCard
            title="Unread"
            value={unreadCount}
            icon={AlertCircle}
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />

          <StatCard
            title="Read"
            value={readCount}
            icon={Check}
            color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Notifications List */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-black/5 sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                All Notifications
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {unreadCount} unread notifications
              </p>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search notifications..."
            />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["All", "Unread", "Read"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  filter === item
                    ? "bg-orange-500 text-black shadow-lg shadow-orange-500/10"
                    : "border border-border bg-muted text-muted-foreground hover:border-orange-500/30 hover:text-orange-500"
                }`}
              >
                {item}

                {item === "Unread" && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      filter === item
                        ? "bg-black/10"
                        : "bg-background"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading, Error and Empty States */}
          {loading ? (
            <LoadingSpinner message="Loading notifications..." />
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => fetchNotifications(true)}
                className="mt-3 font-semibold underline hover:text-red-500 dark:hover:text-red-300"
              >
                Try again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              title="No notifications found"
              description="Notifications will appear here when available."
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex flex-col gap-4 rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-center ${
                    notification.read
                      ? "border-border bg-muted hover:border-orange-500/20 hover:bg-accent"
                      : "border-orange-500/20 bg-orange-500/[0.04] hover:border-orange-500/40 hover:bg-orange-500/[0.07]"
                  }`}
                >
                  {/* Notification Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${getIconStyle(
                      notification.type
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Notification Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                      )}

                      {!notification.read && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {notification.description}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                        aria-label="Mark as read"
                        className="rounded-full border border-orange-500/20 bg-orange-500/10 p-2.5 text-orange-500 transition hover:bg-orange-500 hover:text-black"
                      >
                        <Check size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteId(notification.id)}
                      title="Delete notification"
                      aria-label="Delete notification"
                      className="rounded-full border border-border bg-muted p-2.5 text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        onConfirm={handleDeleteNotification}
        onCancel={() => {
          if (!deleting) setDeleteId(null);
        }}
        loading={deleting}
      />
    </AppLayout>
  );
}
