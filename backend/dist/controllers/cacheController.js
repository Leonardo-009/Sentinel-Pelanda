"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = getCacheStats;
exports.clearCache = clearCache;
const cacheService_1 = require("../services/cacheService");
async function getCacheStats() {
    return {
        stats: cacheService_1.cacheService.getStats(),
        keys: cacheService_1.cacheService.keys(),
    };
}
async function clearCache(type) {
    switch (type) {
        case "threat":
            cacheService_1.cacheService.flushByPattern("threat-*");
            return { message: "Threat cache cleared" };
        case "ai":
            cacheService_1.cacheService.flushByPattern("ai-*");
            return { message: "AI analysis cache cleared" };
        case "all":
            cacheService_1.cacheService.flushAll();
            return { message: "All caches cleared" };
        default:
            throw new Error("Invalid cache type. Use: threat, ai, or all");
    }
}
//# sourceMappingURL=cacheController.js.map