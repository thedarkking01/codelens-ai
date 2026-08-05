import { Router } from "express";
import { searchController } from "../controllers/search.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  searchController.search.bind(searchController)
);

export default router;