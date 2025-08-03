"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
function requestLogger(req, res, next) {
    res.on("finish", () => {
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map