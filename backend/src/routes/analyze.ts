import express, { Router } from "express"
import { body } from "express-validator"
import { analyzeLogController } from "../controllers/analyzeController"
import { asyncHandler } from "../utils/asyncHandler"

const router: Router = express.Router()

// Validation middleware
const validateAnalyzeRequest = [
  body("logText").isString().isLength({ min: 10 }).withMessage("Log text must be at least 10 characters"),
  body("provider").isIn(["local"]).withMessage("Only 'local' provider is available"),
  body("reportType").isIn(["completo", "saude", "refinar"]).withMessage("Invalid report type"),
]

// Test endpoint for direct log analysis
router.post("/test", asyncHandler(async (req, res) => {
  const { logText } = req.body
  
  if (!logText) {
    return res.status(400).json({ error: "logText is required" })
  }

  return res.json({
    original: logText,
    message: "Log analysis test endpoint - no obfuscation applied",
    status: "ready_for_analysis"
  })
}))

// Main analyze endpoint
router.post("/", validateAnalyzeRequest, asyncHandler(async (req, res) => {
  // Only accepts 'local' provider
  if (req.body.provider !== "local") {
    return res.status(400).json({ error: "Only 'local' provider is available in this backend." })
  }
  try {
    const result = await analyzeLogController(req.body)
    if (!result) {
      return res.status(500).json({ error: "Error analyzing log" })
    }
    return res.json(result)
  } catch (error) {
    // Return detailed message for frontend
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
  }
}))

export default router
