import { Request, Response, NextFunction } from "express";
import { searchRepositorySchema } from "../validators/search.validator.js";
import { searchService } from "../services/search.service.js";

export class SearchController {
  async search(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
        const { repositoryId, query, limit } =
        searchRepositorySchema.parse(req.body);

        const results = await searchService.searchRepository(
            repositoryId,
            query,
            limit
        );

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();