import { Router } from "express";
import { indexingJobController } from "../controllers/indexing-job.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/:id",
  authMiddleware,
  indexingJobController.getJobStatus.bind(
    indexingJobController,
  ),
);

export default router;