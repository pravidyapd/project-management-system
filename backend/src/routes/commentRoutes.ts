
import { Router, Response } from "express";
import { db } from "../prisma/db";
import { AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// Helper: Check whether a task belongs to the logged-in user
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

// GET comments for a task
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

    const allComments = await db.orm.public.Comment.all();

    const comments = allComments
      .filter((comment) => comment.taskId === taskId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await db.orm.public.User
          .where({ id: comment.userId })
          .first();

        return {
          ...comment,
          user: user
            ? {
                id: user.id,
                name: user.name,
              }
            : null,
        };
      })
    );

    return res.json({
      success: true,
      data: commentsWithUsers,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
});

// CREATE comment
router.post("/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = Number(req.params.taskId);
    const { content } = req.body;

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const task = await getUserTask(taskId, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comment = await db.orm.public.Comment.create({
      content: content.trim(),
      taskId,
      userId,
    });

    const user = await db.orm.public.User
      .where({ id: userId })
      .first();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        ...comment,
        user: user
          ? {
              id: user.id,
              name: user.name,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
});

// DELETE own comment
router.delete("/:taskId/:commentId", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = Number(req.params.taskId);
    const commentId = Number(req.params.commentId);

    if (
      !Number.isInteger(taskId) ||
      taskId <= 0 ||
      !Number.isInteger(commentId) ||
      commentId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task or comment ID",
      });
    }

    const task = await getUserTask(taskId, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comment = await db.orm.public.Comment
      .where({
        id: commentId,
        taskId,
        userId,
      })
      .first();

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you cannot delete it",
      });
    }

    await db.orm.public.Comment
      .where({
        id: commentId,
        taskId,
        userId,
      })
      .delete();

    return res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
});

export default router;
