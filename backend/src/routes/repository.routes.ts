import { Router } from "express";
import { repositoryController } from "../controllers/repository.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { fileController } from "../controllers/file.controller";
import { chunkController } from "../controllers/chunk.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", (req, res, next) =>
  repositoryController.create(req, res, next),
);

router.get("/", (req, res, next) =>
  repositoryController.getAll(req, res, next),
);

// Repository files
router.get(
  "/:repositoryId/files",
  (req, res, next) =>
    fileController.getRepositoryFiles(
      req,
      res,
      next,
    ),
);

router.get(
  "/:repositoryId/files/:fileId",
  (req, res, next) =>
    fileController.getFile(
      req,
      res,
      next,
    ),
);
router.get(
  "/:id/status",
  (req, res, next) =>
    repositoryController.getStatus(
      req,
      res,
      next,
    ),
);

// Repository by ID
router.get("/:id", (req, res, next) =>
  repositoryController.getById(req, res, next),
);

router.delete("/:id", (req, res, next) =>
  repositoryController.delete(req, res, next),
);


// Repository file chunks
router.get(
  "/:repositoryId/files/:fileId/chunks",
  (req, res, next) =>
    chunkController.getChunksByFile(
      req,
      res,
      next,
    ),
);

router.get(
  "/:repositoryId/chunks/:chunkId",
  (req, res, next) =>
    chunkController.getChunkById(
      req,
      res,
      next,
    ),
);
export default router;