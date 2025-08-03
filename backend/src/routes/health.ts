import express, { Router } from "express"
import { getHealthStatus } from "../controllers/healthController"
import { asyncHandler } from "../utils/asyncHandler"

const router: Router = express.Router()

// GET /api/health - System health check
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const health = await getHealthStatus()

    const statusCode = health.status === "healthy" ? 200 : 503
    res.status(statusCode).json(health)
  }),
)

export default router
