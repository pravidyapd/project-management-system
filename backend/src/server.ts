
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import teamRoutes from "./routes/teamRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public routes
app.get("/", (req, res) => {
  res.send("Project Management API is running!");
});

app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/projects", authenticateToken, projectRoutes);
app.use("/api/tasks", authenticateToken, taskRoutes);
app.use("/api/team", authenticateToken, teamRoutes);
app.use("/api/notifications", authenticateToken, notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
