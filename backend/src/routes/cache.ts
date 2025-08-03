import express, { Router } from "express"
import { query, validationResult } from "express-validator"
import { clearCache, getCacheStats } from "../controllers/cacheController"
import { asyncHandler } from "../utils/asyncHandler"

const router: Router = express.Router()

// GET /api/cache - Get cache statistics
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const stats = await getCacheStats()
    if (!stats) {
      return res.status(500).json({ error: "Erro ao obter estatísticas do cache" })
    }
    return res.json(stats)
  }),
)

// DELETE /api/cache - Clear cache
router.delete(
  "/",
  [query("type").optional().isIn(["threat", "ai", "all"]).withMessage("Invalid cache type")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const type = (req.query.type as string) || "all"
    const cleared = await clearCache(type)
    if (!cleared) {
      return res.status(500).json({ error: "Erro ao limpar o cache" })
    }
    return res.json({ cleared })
  }),
)

export default router
