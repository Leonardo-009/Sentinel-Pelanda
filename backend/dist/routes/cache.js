"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const cacheController_1 = require("../controllers/cacheController");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = express_1.default.Router();
router.get("/", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await (0, cacheController_1.getCacheStats)();
    if (!stats) {
        return res.status(500).json({ error: "Erro ao obter estatísticas do cache" });
    }
    return res.json(stats);
}));
router.delete("/", [(0, express_validator_1.query)("type").optional().isIn(["threat", "ai", "all"]).withMessage("Invalid cache type")], (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array(),
        });
    }
    const type = req.query.type || "all";
    const cleared = await (0, cacheController_1.clearCache)(type);
    if (!cleared) {
        return res.status(500).json({ error: "Erro ao limpar o cache" });
    }
    return res.json({ cleared });
}));
exports.default = router;
//# sourceMappingURL=cache.js.map