"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const analyze_1 = __importDefault(require("./routes/analyze"));
const cache_1 = __importDefault(require("./routes/cache"));
const health_1 = __importDefault(require("./routes/health"));
const threats_1 = __importDefault(require("./routes/threats"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, morgan_1.default)("combined"));
app.use(requestLogger_1.requestLogger);
app.get("/", (req, res) => {
    res.json({
        name: "ShadoIA Backend API",
        version: "2.0.0",
        status: "running",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/analyze", analyze_1.default);
app.use("/api/threats", threats_1.default);
app.use("/api/health", health_1.default);
app.use("/api/cache", cache_1.default);
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl,
        method: req.method,
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
});
exports.default = app;
//# sourceMappingURL=server.js.map