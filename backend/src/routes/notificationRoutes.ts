
import { Router, Response } from "express";
import { db } from "../prisma/db";
import { AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// GET notifications belonging to the logged-in user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await db.orm.public.Notification
      .where({ userId: req.userId! })
      .all();

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

// CREATE notification
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const notification = await db.orm.public.Notification.create({
      title: title.trim(),
      description: description.trim(),
      type: type || "system",
      userId: req.userId!,
    });

    return res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
});

// MARK notification as read
router.put("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await db.orm.public.Notification
      .where({
        id,
        userId: req.userId!,
      })
      .update({ read: true });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
});

// MARK all notifications as read
router.put("/read-all", async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await db.orm.public.Notification
      .where({
        userId: req.userId!,
        read: false,
      })
      .update({ read: true });

    return res.json({
      success: true,
      message: "All notifications marked as read",
      data: notifications,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
});

// DELETE notification
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const deletedNotification = await db.orm.public.Notification
      .where({
        id,
        userId: req.userId!,
      })
      .delete();

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
});

export default router;
