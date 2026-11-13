
import { Router, Response } from "express";
import path from "path";
import fs from "fs";

import { db } from "../prisma/db";
import { AuthRequest } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();

const uploadDirectory = path.resolve(process.cwd(), "uploads");

// Check whether a task belongs to the logged-in user
async function getUserTask(taskId: number, userId: number) {
  const task = await db.orm.public.Task
    .where({ id: taskId })
    .first();

  if (!task) return null;

  const project = await db.orm.public.Project
    .where({
      id: task.projectId,
      userId,
    })
    .first();

  return project ? task : null;
}

// GET all attachments for a task
router.get("/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await getUserTask(taskId, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const allAttachments =
      await db.orm.public.TaskAttachment.all();

    const attachments = allAttachments
      .filter((attachment) => attachment.taskId === taskId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    return res.json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    console.error("Error fetching attachments:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attachments",
    });
  }
});

// UPLOAD attachment
router.post(
  "/:taskId",
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "File upload failed",
        });
      }

      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const taskId = Number(req.params.taskId);

      if (!Number.isInteger(taskId) || taskId <= 0) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: "Invalid task ID",
        });
      }

      const task = await getUserTask(taskId, userId);

      if (!task) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a file",
        });
      }

      const attachment =
        await db.orm.public.TaskAttachment.create({
          fileName: req.file.originalname,
          fileUrl: req.file.filename,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          taskId,
        });

      // Create notification for the logged-in user
      await db.orm.public.Notification.create({
        title: "File Uploaded",
        description: `You uploaded "${req.file.originalname}" to "${task.title}".`,
        type: "attachment",
        userId,
      });

      return res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: attachment,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Error uploading attachment:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to upload file",
      });
    }
  }
);

// DOWNLOAD attachment
router.get(
  "/:taskId/:attachmentId/download",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const taskId = Number(req.params.taskId);
      const attachmentId = Number(req.params.attachmentId);

      if (
        !Number.isInteger(taskId) ||
        taskId <= 0 ||
        !Number.isInteger(attachmentId) ||
        attachmentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task or attachment ID",
        });
      }

      const task = await getUserTask(taskId, userId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      const attachment = await db.orm.public.TaskAttachment
        .where({
          id: attachmentId,
          taskId,
        })
        .first();

      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: "Attachment not found",
        });
      }

      const filePath = path.join(
        uploadDirectory,
        path.basename(attachment.fileUrl)
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "File not found on server",
        });
      }

      return res.download(filePath, attachment.fileName);
    } catch (error) {
      console.error("Error downloading attachment:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to download file",
      });
    }
  }
);

// DELETE attachment
router.delete(
  "/:taskId/:attachmentId",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const taskId = Number(req.params.taskId);
      const attachmentId = Number(req.params.attachmentId);

      if (
        !Number.isInteger(taskId) ||
        taskId <= 0 ||
        !Number.isInteger(attachmentId) ||
        attachmentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task or attachment ID",
        });
      }

      const task = await getUserTask(taskId, userId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      const attachment = await db.orm.public.TaskAttachment
        .where({
          id: attachmentId,
          taskId,
        })
        .first();

      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: "Attachment not found",
        });
      }

      const filePath = path.join(
        uploadDirectory,
        path.basename(attachment.fileUrl)
      );

      await db.orm.public.TaskAttachment
        .where({
          id: attachmentId,
          taskId,
        })
        .delete();

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.json({
        success: true,
        message: "Attachment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete attachment",
      });
    }
  }
);

export default router;
