
import { Router, Response } from "express";
import { db } from "../prisma/db";
import { AuthRequest } from "../middleware/authMiddleware";

const router = Router();

const VALID_PRIORITIES = ["Low", "Medium", "High"];

// Helper function to create user-specific notifications
async function createNotification(
  title: string,
  description: string,
  userId: number
) {
  try {
    await db.orm.public.Notification.create({
      title,
      description,
      type: "task",
      userId,
    });
  } catch (error) {
    console.error("Task notification failed:", error);
  }
}

// Validate and retrieve an assignee belonging to the logged-in user
async function validateAssignee(assigneeId: unknown, userId: number) {
  if (assigneeId === null || assigneeId === undefined || assigneeId === "") {
    return { valid: true, id: null };
  }

  const parsedId = Number(assigneeId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return { valid: false, id: null };
  }

  const member = await db.orm.public.TeamMember
    .where({
      id: parsedId,
      userId,
    })
    .first();

  if (!member) {
    return { valid: false, id: null };
  }

  return { valid: true, id: parsedId };
}

// GET all tasks belonging to the logged-in user's projects
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const projects = await db.orm.public.Project
      .where({ userId })
      .all();

    const projectIds = projects.map((project) => project.id);

    const allTasks = await db.orm.public.Task.all();

    const tasks = allTasks.filter((task) =>
      projectIds.includes(task.projectId)
    );

    const teamMembers = await db.orm.public.TeamMember
      .where({ userId })
      .all();

    const tasksWithAssignee = tasks.map((task) => {
      const assignee = teamMembers.find(
        (member) => member.id === task.assigneeId
      );

      return {
        ...task,
        assignee: assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              email: assignee.email,
              role: assignee.role,
            }
          : null,
      };
    });

    return res.json({
      success: true,
      data: tasksWithAssignee,
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
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      title,
      description,
      status,
      projectId,
      dueDate,
      priority,
      assigneeId,
    } = req.body;

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

    const taskPriority = priority || "Medium";

    if (!VALID_PRIORITIES.includes(taskPriority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be Low, Medium, or High",
      });
    }

    const project = await db.orm.public.Project
      .where({
        id: parsedProjectId,
        userId,
      })
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const assignee = await validateAssignee(assigneeId, userId);

    if (!assignee.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member assignment",
      });
    }

    const parsedDate = dueDate ? new Date(dueDate) : null;

    if (parsedDate && isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const newTask = await db.orm.public.Task.create({
      title: title.trim(),
      description: description || null,
      status: status || "To Do",
      priority: taskPriority,
      projectId: parsedProjectId,
      dueDate: parsedDate,
      assigneeId: assignee.id,
    });

    await createNotification(
      "New Task Created",
      `A new task "${newTask.title}" has been created.`,
      userId
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
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = Number(req.params.id);

    const {
      title,
      description,
      status,
      dueDate,
      priority,
      assigneeId,
    } = req.body;

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await db.orm.public.Task
      .where({ id: taskId })
      .first();

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project = await db.orm.public.Project
      .where({
        id: existingTask.projectId,
        userId,
      })
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updates: {
      title?: string;
      description?: string | null;
      status?: string;
      dueDate?: Date | null;
      priority?: string;
      assigneeId?: number | null;
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

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Priority must be Low, Medium, or High",
        });
      }

      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      const parsedDate = dueDate ? new Date(dueDate) : null;

      if (parsedDate && isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }

      updates.dueDate = parsedDate;
    }

    if (assigneeId !== undefined) {
      const assignee = await validateAssignee(assigneeId, userId);

      if (!assignee.valid) {
        return res.status(400).json({
          success: false,
          message: "Invalid team member assignment",
        });
      }

      updates.assigneeId = assignee.id;
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
        `The status of task "${updatedTask.title}" was updated to "${status}".`,
        userId
      );
    } else {
      await createNotification(
        "Task Updated",
        `Task "${updatedTask.title}" has been updated.`,
        userId
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
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await db.orm.public.Task
      .where({ id: taskId })
      .first();

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project = await db.orm.public.Project
      .where({
        id: existingTask.projectId,
        userId,
      })
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
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
      `Task "${deletedTask.title}" has been deleted.`,
      userId
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
