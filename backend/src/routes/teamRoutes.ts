
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
      type: "system",
      userId,
    });
  } catch (error) {
    console.error("Failed to create team notification:", error);
  }
}

// GET all team members belonging to the logged-in user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const members = await db.orm.public.TeamMember
      .where({ userId: req.userId! })
      .all();

    return res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
});

// CREATE team member
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required",
      });
    }

    const member = await db.orm.public.TeamMember.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      userId: req.userId!,
    });

    await createNotification(
      "New Team Member Added",
      `${member.name} has been added to the team as ${member.role}.`,
      req.userId!
    );

    return res.status(201).json({
      success: true,
      data: member,
      message: "Team member added successfully",
    });
  } catch (error) {
    console.error("Create team member error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add team member. Check whether the email already exists.",
    });
  }
});

// UPDATE team member
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, role } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required",
      });
    }

    const member = await db.orm.public.TeamMember
      .where({
        id,
        userId: req.userId!,
      })
      .update({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
      });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    await createNotification(
      "Team Member Updated",
      `${member.name}'s team details have been updated.`,
      req.userId!
    );

    return res.json({
      success: true,
      data: member,
      message: "Team member updated successfully",
    });
  } catch (error) {
    console.error("Update team member error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update team member",
    });
  }
});

// DELETE team member
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
      });
    }

    const deletedMember = await db.orm.public.TeamMember
      .where({
        id,
        userId: req.userId!,
      })
      .delete();

    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    await createNotification(
      "Team Member Removed",
      `Team member #${id} has been removed from the team.`,
      req.userId!
    );

    return res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete team member",
    });
  }
});

export default router;
