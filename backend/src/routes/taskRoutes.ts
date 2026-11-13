
import { Router, Request, Response } from "express";
import { db } from "../prisma/db";

const router = Router();

// Helper function to create notifications
async function createNotification(title: string, description: string) {
  try {
    await db.orm.public.Notification.create({
      title,
      description,
      type: "task",
    });
  } catch (error) {
    console.error("Task notification failed:", error);
  }
}

// GET all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await db.orm.public.Task.all();

    return res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
});

// CREATE task
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, status, projectId, dueDate } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const parsedProjectId = Number(projectId);

    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required",
      });
    }

    const newTask = await db.orm.public.Task.create({
      title: title.trim(),
      description: description || null,
      status: status || "To Do",
      projectId: parsedProjectId,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await createNotification(
      "New Task Created",
      `A new task "${newTask.title}" has been created.`
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
});

// UPDATE task
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.id);
    const { title, description, status, dueDate } = req.body;

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const updates: {
      title?: string;
      description?: string | null;
      status?: string;
      dueDate?: Date | null;
    } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No task details provided to update",
      });
    }

    const updatedTask = await db.orm.public.Task
      .where({ id: taskId })
      .update(updates);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (status !== undefined) {
      await createNotification(
        "Task Status Updated",
        `The status of task "${updatedTask.title}" was updated to "${status}".`
      );
    } else {
      await createNotification(
        "Task Updated",
        `Task "${updatedTask.title}" has been updated.`
      );
    }

    return res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
});

// DELETE task
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const deletedTask = await db.orm.public.Task
      .where({ id: taskId })
      .delete();

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await createNotification(
      "Task Deleted",
      `Task "${deletedTask.title}" has been deleted.`
    );

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
});

export default router;
