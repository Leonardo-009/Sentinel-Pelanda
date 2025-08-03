"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = getHealthStatus;
const aiService_1 = require("../services/aiService");
async function getHealthStatus() {
    const timestamp = new Date().toISOString();
    const aiProviders = await (0, aiService_1.checkAIProviders)();
    return {
        status: "healthy",
        timestamp,
        version: "3.0.0",
        services: {
            api: "operational",
            database: "operational",
            cache: "operational"
        },
        ai: {
            providers: aiProviders,
            status: aiProviders.local ? "available" : "unavailable"
        },
        environment: process.env.NODE_ENV || "development"
    };
}
//# sourceMappingURL=healthController.js.map