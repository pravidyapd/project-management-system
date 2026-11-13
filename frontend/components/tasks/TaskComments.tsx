
"use client";

import { useEffect, useState, type FormEvent } from "react";
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="page-enter flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-2xl shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1c1c1c] p-5">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare size={19} className="text-orange-400" />
              <h2 className="text-lg font-bold text-white">
                Task Comments
              </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-400">
              {taskTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="rounded-full p-2 text-zinc-400 transition-all hover:bg-orange-500/10 hover:text-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="min-h-[200px] flex-1 space-y-4 overflow-y-auto p-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare
                size={32}
                className="mx-auto mb-3 text-zinc-600"
              />
              <p className="font-medium text-zinc-300">
                No comments yet
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Be the first to add a comment.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-white/[0.06] bg-[#202020] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {comment.user?.name || "Unknown User"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    title="Delete comment"
                    aria-label="Delete comment"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 p-5"
        >
          <label className="mb-2 block text-sm font-semibold text-zinc-200">
            Add a comment
          </label>

          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
          />

          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-5 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
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
    </div>
  );
}
