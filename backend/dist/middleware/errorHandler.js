"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, _next) {
    console.error("Error:", err);
    const error = {
        message: err.message || "Internal Server Error",
        status: err.status || 500,
    };
    if (err.name === "ValidationError") {
        error.status = 400;
        error.message = "Validation Error";
    }
    if (err.status === 429) {
        error.message = "Too Many Requests";
    }
    if (err.message.includes("API")) {
        error.status = 503;
        error.message = "External API Error";
    }
    res.status(error.status).json({
        error: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
//# sourceMappingURL=errorHandler.js.map