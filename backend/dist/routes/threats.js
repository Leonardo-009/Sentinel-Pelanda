"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const threatController_1 = require("../controllers/threatController");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = express_1.default.Router();
const validateThreatRequest = [
    (0, express_validator_1.body)("items").isArray({ min: 1, max: 500 }).withMessage("Items must be an array with 1-500 elements"),
    (0, express_validator_1.body)("items.*").notEmpty().withMessage("Each item must not be empty"),
    (0, express_validator_1.body)("type").isIn(["ip", "url", "hash", "phishing"]).withMessage("Type must be ip, url, hash, or phishing"),
];
router.post("/verify", validateThreatRequest, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array(),
        });
    }
    const result = await (0, threatController_1.verifyThreatsController)(req.body);
    if (!result) {
        return res.status(500).json({ error: "Erro ao verificar ameaças" });
    }
    return res.json(result);
}));
exports.default = router;
//# sourceMappingURL=threats.js.map