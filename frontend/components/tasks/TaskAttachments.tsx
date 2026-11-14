
"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  X,
  File,
} from "lucide-react";

import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  type TaskAttachment,
} from "@/api/attachmentApi";

interface TaskAttachmentsProps {
  taskId: number;
  taskTitle: string;
  onClose: () => void;
}

export default function TaskAttachments({
  taskId,
  taskTitle,
  onClose,
}: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const fetchAttachments = async () => {
    try {
      const response = await getAttachments(taskId);
      setAttachments(response.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load attachments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const response = await uploadAttachment(taskId, file);

      setAttachments((previous) => [
        response.data,
        ...previous,
      ]);

      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload file."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    setDownloadingId(attachment.id);

    try {
      await downloadAttachment(
        taskId,
        attachment.id,
        attachment.fileName
      );

      toast.success("Download started!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to download file."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    setDeletingId(attachmentId);

    try {
      await deleteAttachment(taskId, attachmentId);

      setAttachments((previous) =>
        previous.filter((item) => item.id !== attachmentId)
      );

      toast.success("Attachment deleted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete attachment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md dark:bg-black/50"
      onMouseDown={onClose}
    >
      <div
        className="page-enter flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#171717] dark:shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-[#1c1c1c]">
          <div>
            <div className="flex items-center gap-2">
              <Paperclip
                size={19}
                className="text-orange-600 dark:text-orange-400"
              />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Task Attachments
              </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {taskTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close attachments"
            className="rounded-full p-2 text-zinc-500 transition-all hover:bg-orange-500/10 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Upload Section */}
        <div className="border-b border-zinc-200 p-5 dark:border-white/10">
          <label
            htmlFor="task-file-upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 px-4 py-5 text-sm font-medium text-orange-600 transition hover:border-orange-500 hover:bg-orange-500/10 dark:text-orange-400"
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Choose a file to upload"}
          </label>

          <input
            id="task-file-upload"
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />

          <p className="mt-2 text-center text-xs text-zinc-500">
            Maximum file size: 10 MB
          </p>
        </div>

        {/* Attachments List */}
        <div className="min-h-[200px] flex-1 space-y-3 overflow-y-auto p-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading attachments...
            </p>
          ) : attachments.length === 0 ? (
            <div className="py-10 text-center">
              <Paperclip
                size={32}
                className="mx-auto mb-3 text-zinc-400 dark:text-zinc-600"
              />
              <p className="font-medium text-zinc-800 dark:text-zinc-300">
                No attachments yet
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Upload a file to attach it to this task.
              </p>
            </div>
          ) : (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-[#202020]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <File
                    size={22}
                    className="shrink-0 text-orange-600 dark:text-orange-400"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {attachment.fileName}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {formatFileSize(attachment.fileSize)}
                      {" · "}
                      {new Date(
                        attachment.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(attachment)}
                    disabled={downloadingId === attachment.id}
                    title="Download file"
                    aria-label="Download file"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-orange-500/10 hover:text-orange-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-orange-400"
                  >
                    <Download size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deletingId === attachment.id}
                    title="Delete file"
                    aria-label="Delete file"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-zinc-200 p-5 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
