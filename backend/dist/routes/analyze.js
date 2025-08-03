"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const analyzeController_1 = require("../controllers/analyzeController");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = express_1.default.Router();
const validateAnalyzeRequest = [
    (0, express_validator_1.body)("logText").isString().isLength({ min: 10 }).withMessage("Log text must be at least 10 characters"),
    (0, express_validator_1.body)("provider").isIn(["local"]).withMessage("Only 'local' provider is available"),
    (0, express_validator_1.body)("reportType").isIn(["completo", "saude", "refinar"]).withMessage("Invalid report type"),
];
router.post("/test", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { logText } = req.body;
    if (!logText) {
        return res.status(400).json({ error: "logText is required" });
    }
    return res.json({
        original: logText,
        message: "Log analysis test endpoint - no obfuscation applied",
        status: "ready_for_analysis"
    });
}));
router.post("/", validateAnalyzeRequest, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (req.body.provider !== "local") {
        return res.status(400).json({ error: "Only 'local' provider is available in this backend." });
    }
    try {
        const result = await (0, analyzeController_1.analyzeLogController)(req.body);
        if (!result) {
            return res.status(500).json({ error: "Error analyzing log" });
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
}));
exports.default = router;
//# sourceMappingURL=analyze.js.map