"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthController_1 = require("../controllers/healthController");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = express_1.default.Router();
router.get("/", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const health = await (0, healthController_1.getHealthStatus)();
    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
}));
exports.default = router;
//# sourceMappingURL=health.js.map