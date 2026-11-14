
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Trash2,
  X,
} from "lucide-react";

import {
  getComments,
  createComment,
  deleteComment,
  type Comment,
} from "@/api/commentApi";

interface TaskCommentsProps {
  taskId: number;
  taskTitle: string;
  onClose: () => void;
}

export default function TaskComments({
  taskId,
  taskTitle,
  onClose,
}: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const fetchComments = async () => {
    try {
      const response = await getComments(taskId);
      setComments(response.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load comments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setSaving(true);

    try {
      const response = await createComment(taskId, content.trim());

      setComments((previous) => [...previous, response.data]);
      setContent("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add comment."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId);

    try {
      await deleteComment(taskId, commentId);

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId)
      );

      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete comment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md dark:bg-black/50"
      onMouseDown={onClose}
    >
      <div
        className="page-enter flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 dark:shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted p-5">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare
                size={19}
                className="text-orange-600 dark:text-orange-400"
              />
              <h2 className="text-lg font-bold text-foreground">
                Task Comments
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {taskTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="rounded-full p-2 text-muted-foreground transition-all hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="min-h-[200px] flex-1 space-y-4 overflow-y-auto p-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare
                size={32}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <p className="font-medium text-foreground">
                No comments yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to add a comment.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-border bg-muted p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {comment.user?.name || "Unknown User"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    title="Delete comment"
                    aria-label="Delete comment"
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border p-5"
        >
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Add a comment
          </label>

          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
          />

          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              Done
            </button>

            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="orange-button flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {saving ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
