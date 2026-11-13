
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import teamRoutes from "./routes/teamRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Project Management API is running!");
});

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
