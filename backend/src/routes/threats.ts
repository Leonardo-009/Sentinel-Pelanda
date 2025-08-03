import express, { Router } from "express"
import { body, validationResult } from "express-validator"
import { verifyThreatsController } from "../controllers/threatController"
import { asyncHandler } from "../utils/asyncHandler"

const router: Router = express.Router()

// Validation middleware
const validateThreatRequest = [
  body("items").isArray({ min: 1, max: 500 }).withMessage("Items must be an array with 1-500 elements"),

  body("items.*").notEmpty().withMessage("Each item must not be empty"),

  body("type").isIn(["ip", "url", "hash", "phishing"]).withMessage("Type must be ip, url, hash, or phishing"),
]

// POST /api/threats/verify - Verify threat indicators
router.post(
  "/verify",
  validateThreatRequest,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const result = await verifyThreatsController(req.body)
    if (!result) {
      return res.status(500).json({ error: "Erro ao verificar ameaças" })
    }
    return res.json(result)
  }),
)

export default router
