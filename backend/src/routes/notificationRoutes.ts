
import { Router, Request, Response } from "express";
import { db } from "../prisma/db";

const router = Router();

// GET all notifications
router.get("/", async (req: Request, res: Response) => {
  try {
    const notifications = await db.orm.public.Notification.all();

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

// CREATE notification
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const notification = await db.orm.public.Notification.create({
      title,
      description,
      type: type || "system",
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
});

// MARK notification as read
router.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await db.orm.public.Notification
      .where({ id })
      .update({ read: true });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
});

// DELETE notification
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    await db.orm.public.Notification.where({ id }).delete();

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
});

export default router;
