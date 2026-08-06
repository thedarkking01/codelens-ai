import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import repositoryRoutes from "./routes/repository.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import searchRoutes from "./routes/search.routes.js";
import chatRoutes from "./routes/chat.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/v1/repositories", repositoryRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "CodeLens AI Backend Running 🚀",
  });
});
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/chat", chatRoutes);

// Global error middleware MUST be registered last
app.use(errorMiddleware);

export default app;

