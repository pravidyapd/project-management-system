
import { Router, Response } from "express";
import { db } from "../prisma/db";
import { AuthRequest } from "../middleware/authMiddleware";

const router = Router();

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
      type: "project",
      userId,
    });
  } catch (error) {
    console.error("Failed to create project notification:", error);
  }
}

// GET all projects belonging to the logged-in user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const projects = await db.orm.public.Project
      .where({ userId: req.userId! })
      .all();

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
});

// CREATE project
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const newProject = await db.orm.public.Project.create({
      name: name.trim(),
      description: description || null,
      status: status || "Planning",
      userId: req.userId!,
    });

    await createNotification(
      "New Project Created",
      `A new project "${newProject.name}" has been created.`,
      req.userId!
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
});

// UPDATE project
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const { name, description, status } = req.body;

    const updates: {
      name?: string;
      description?: string | null;
      status?: string;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name cannot be empty",
        });
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No project changes provided",
      });
    }

    const updatedProject = await db.orm.public.Project
      .where({
        id: projectId,
        userId: req.userId!,
      })
      .update(updates);

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await createNotification(
      "Project Updated",
      `The project "${updatedProject.name}" has been updated.`,
      req.userId!
    );

    return res.json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
});

// DELETE project
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const deletedProject = await db.orm.public.Project
      .where({
        id: projectId,
        userId: req.userId!,
      })
      .delete();

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await createNotification(
      "Project Deleted",
      `Project #${projectId} has been deleted.`,
      req.userId!
    );

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
});

export default router;
