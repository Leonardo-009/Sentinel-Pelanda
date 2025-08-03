"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyThreatsController = verifyThreatsController;
const crypto_1 = require("crypto");
const cacheService_1 = require("../services/cacheService");
const threatIntelligenceService_1 = require("../services/threatIntelligenceService");
const threatService = new threatIntelligenceService_1.ThreatIntelligenceService();
async function verifyThreatsController(data) {
    const { items, type } = data;
    const startTime = Date.now();
    const results = [];
    const errors = [];
    for (const item of items) {
        try {
            const trimmedItem = item.trim();
            if (!trimmedItem)
                continue;
            const cacheKey = `threat-${type}-${(0, crypto_1.createHash)("md5").update(trimmedItem).digest("hex")}`;
            const cachedResult = cacheService_1.cacheService.get(cacheKey);
            if (cachedResult) {
                results.push({ ...cachedResult, cached: true });
                continue;
            }
            if (!validateIndicator(trimmedItem, type)) {
                errors.push(`Invalid ${type} format: ${trimmedItem}`);
                continue;
            }
            let combinedResult;
            if (type === "phishing") {
                combinedResult = await threatService.checkPhishing(trimmedItem);
                if (!combinedResult) {
                    combinedResult = {
                        value: trimmedItem,
                        status: "clean",
                        confidence: 0,
                        source: "URLScan Error",
                        details: "Unexpected null result from URLScan service"
                    };
                }
            }
            else {
                const threatResults = await threatService.checkIndicator(trimmedItem, type);
                combinedResult = threatService.combineResults(threatResults);
            }
            cacheService_1.cacheService.set(cacheKey, combinedResult, 14400);
            results.push(combinedResult);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        catch (error) {
            errors.push(`Error checking ${item}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const stats = {
        total: results.length,
        malicious: results.filter((r) => r.status === "malicious").length,
        suspicious: results.filter((r) => r.status === "suspicious").length,
        clean: results.filter((r) => r.status === "clean").length,
    };
    return {
        ...stats,
        items: results,
        summary: {
            totalScanned: results.length,
            processingTime: `${processingTime}s`,
            sources: type === "phishing" ? ["URLScan.io"] : ["VirusTotal", "AbuseIPDB"],
            errors: errors.length > 0 ? errors : undefined,
        },
    };
}
function validateIndicator(indicator, type) {
    switch (type) {
        case "ip":
            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            return ipv4Regex.test(indicator) || ipv6Regex.test(indicator);
        case "url":
        case "phishing":
            try {
                new URL(indicator);
                return true;
            }
            catch {
                return false;
            }
        case "hash":
            const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
            return hashRegex.test(indicator);
        default:
            return false;
    }
}
//# sourceMappingURL=threatController.js.map