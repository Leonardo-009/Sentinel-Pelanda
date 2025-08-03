"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatIntelligenceService = void 0;
class ThreatIntelligenceService {
    constructor() {
        this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY || "";
        this.abuseIPDBApiKey = process.env.ABUSEIPDB_API_KEY || "";
        this.urlscanApiKey = process.env.URLSCAN_API_KEY || "";
    }
    async checkVirusTotal(indicator, type) {
        if (!this.virusTotalApiKey) {
            console.log("VirusTotal API key not configured, skipping VirusTotal check");
            return null;
        }
        try {
            let endpoint = "";
            let encodedIndicator = indicator;
            switch (type) {
                case "ip":
                    endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`;
                    break;
                case "url":
                    encodedIndicator = Buffer.from(indicator).toString("base64").replace(/=/g, "");
                    endpoint = `https://www.virustotal.com/api/v3/urls/${encodedIndicator}`;
                    break;
                case "hash":
                    endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`;
                    break;
            }
            const response = await fetch(endpoint, {
                headers: {
                    "X-Apikey": this.virusTotalApiKey,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        value: indicator,
                        status: "clean",
                        confidence: 50,
                        source: "VirusTotal",
                        details: "Not found in database",
                    };
                }
                throw new Error(`VirusTotal API error: ${response.status}`);
            }
            const data = await response.json();
            const stats = data.data.attributes.last_analysis_stats;
            const malicious = stats.malicious || 0;
            const suspicious = stats.suspicious || 0;
            const total = malicious + suspicious + (stats.undetected || 0) + (stats.harmless || 0);
            let status = "clean";
            let confidence = 50;
            if (malicious > 0) {
                status = "malicious";
                confidence = Math.min(95, 60 + (malicious / total) * 35);
            }
            else if (suspicious > 0) {
                status = "suspicious";
                confidence = Math.min(80, 40 + (suspicious / total) * 40);
            }
            else {
                const harmlessRatio = (stats.harmless || 0) / total;
                const undetectedRatio = (stats.undetected || 0) / total;
                confidence = Math.max(60, Math.min(95, 70 + (harmlessRatio * 25) - (undetectedRatio * 15)));
            }
            let threatType = undefined;
            if (data.data.attributes.tags && data.data.attributes.tags.length > 0) {
                threatType = data.data.attributes.tags[0];
            }
            return {
                value: indicator,
                status,
                confidence: Math.round(confidence),
                threat_type: threatType,
                source: "VirusTotal",
                detections: malicious + suspicious,
                country: data.data.attributes.country,
                lastSeen: data.data.attributes.last_seen,
                details: {
                    last_analysis_stats: stats,
                    tags: data.data.attributes.tags,
                    reputation: data.data.attributes.reputation,
                    as_owner: data.data.attributes.as_owner,
                    continent: data.data.attributes.continent,
                    city: data.data.attributes.city,
                    malicious_score: malicious,
                    suspicious_score: suspicious,
                    harmless_score: stats.harmless || 0,
                    undetected_score: stats.undetected || 0,
                    total_engines: total,
                },
            };
        }
        catch {
            return null;
        }
    }
    async checkAbuseIPDB(ip) {
        if (!this.abuseIPDBApiKey) {
            return null;
        }
        try {
            const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
                headers: {
                    Key: this.abuseIPDBApiKey,
                    Accept: "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`AbuseIPDB API error: ${response.status}`);
            }
            const result = await response.json();
            const data = result.data;
            let status = "clean";
            const abuseConfidence = data.abuseConfidenceScore;
            if (abuseConfidence >= 75) {
                status = "malicious";
            }
            else if (abuseConfidence >= 25) {
                status = "suspicious";
            }
            let finalConfidence = abuseConfidence;
            if (status === "clean") {
                finalConfidence = Math.max(70, 100 - abuseConfidence);
            }
            let threatType = undefined;
            if (data.reports && data.reports.length > 0) {
                const reportTypes = data.reports.map((report) => report.type).filter((type) => type);
                if (reportTypes.length > 0) {
                    threatType = reportTypes[0];
                }
            }
            return {
                value: ip,
                status,
                confidence: finalConfidence,
                threat_type: threatType,
                source: "AbuseIPDB",
                country: data.countryCode,
                lastSeen: data.lastReportedAt,
                details: {
                    abuseConfidence,
                    totalReports: data.totalReports,
                    isPublic: data.isPublic,
                    isp: data.isp,
                    domain: data.domain,
                    hostnames: data.hostnames,
                    usageType: data.usageType,
                    reports: data.reports,
                    abuse_score: abuseConfidence,
                },
            };
        }
        catch {
            return null;
        }
    }
    async checkPhishing(url) {
        console.log("Checking phishing for URL:", url);
        console.log("URLScan API Key configured:", !!this.urlscanApiKey);
        if (!this.urlscanApiKey) {
            console.log("URLScan API key not configured, skipping phishing check");
            return {
                value: url,
                status: "clean",
                confidence: 0,
                source: "URLScan not configured",
                details: {
                    error_message: "URLScan API key not configured in environment variables"
                }
            };
        }
        try {
            const { urlscanService } = await Promise.resolve().then(() => __importStar(require('./urlscanService')));
            if (!urlscanService.isConfigured()) {
                console.log("URLScan service not configured");
                return {
                    value: url,
                    status: "clean",
                    confidence: 0,
                    source: "URLScan not configured",
                    details: {
                        error_message: "URLScan service not properly configured"
                    }
                };
            }
            console.log("Calling URLScan service for URL:", url);
            const result = await urlscanService.analyzeURL(url);
            console.log("URLScan result received:", result.source, result.status);
            return {
                value: result.value,
                status: result.status,
                confidence: result.confidence,
                threat_type: result.details.brand_detected ? `Brand Impersonation: ${result.details.brand_detected}` : undefined,
                source: result.source,
                detections: result.detections,
                details: result.details
            };
        }
        catch (error) {
            console.error("URLScan phishing check error:", error);
            return {
                value: url,
                status: "clean",
                confidence: 0,
                source: "URLScan Error",
                details: {
                    error_message: error instanceof Error ? error.message : "Unknown error during URLScan analysis"
                }
            };
        }
    }
    async checkIndicator(indicator, type) {
        const results = [];
        try {
            const vtResult = await this.checkVirusTotal(indicator, type);
            if (vtResult) {
                results.push(vtResult);
            }
            if (type === "ip") {
                const abuseResult = await this.checkAbuseIPDB(indicator);
                if (abuseResult) {
                    results.push(abuseResult);
                }
            }
            if (results.length === 0) {
                results.push({
                    value: indicator,
                    status: "clean",
                    confidence: 50,
                    source: "No APIs available",
                    details: "No threat intelligence APIs configured",
                });
            }
            return results;
        }
        catch {
            return [{
                    value: indicator,
                    status: "clean",
                    confidence: 50,
                    source: "Error",
                    details: "Error checking indicator",
                }];
        }
    }
    async checkPhishingBatch(urls) {
        if (!this.urlscanApiKey) {
            console.log("URLScan API key not configured, skipping phishing batch check");
            return urls.map(url => ({
                value: url,
                status: "clean",
                confidence: 0,
                source: "URLScan not configured",
                details: "URLScan API key not configured"
            }));
        }
        try {
            const { urlscanService } = await Promise.resolve().then(() => __importStar(require('./urlscanService')));
            if (!urlscanService.isConfigured()) {
                return urls.map(url => ({
                    value: url,
                    status: "clean",
                    confidence: 0,
                    source: "URLScan not configured",
                    details: "URLScan API key not configured"
                }));
            }
            const results = await urlscanService.analyzeMultipleURLs(urls);
            return results.map(result => ({
                value: result.value,
                status: result.status,
                confidence: result.confidence,
                threat_type: result.details.brand_detected ? `Brand Impersonation: ${result.details.brand_detected}` : undefined,
                source: result.source,
                detections: result.detections,
                details: result.details
            }));
        }
        catch (error) {
            console.error("URLScan batch phishing check error:", error);
            return urls.map(url => ({
                value: url,
                status: "clean",
                confidence: 0,
                source: "URLScan Error",
                details: "Error during URLScan analysis"
            }));
        }
    }
    combineResults(results) {
        if (results.length === 0) {
            throw new Error("No results to combine");
        }
        if (results.length === 1) {
            return results[0];
        }
        const maliciousResults = results.filter((r) => r.status === "malicious");
        const suspiciousResults = results.filter((r) => r.status === "suspicious");
        let finalStatus = "clean";
        let finalConfidence = 50;
        const sources = results.map((r) => r.source).join(", ");
        if (maliciousResults.length > 0) {
            finalStatus = "malicious";
            finalConfidence = Math.max(...maliciousResults.map((r) => r.confidence));
        }
        else if (suspiciousResults.length > 0) {
            finalStatus = "suspicious";
            finalConfidence = Math.max(...suspiciousResults.map((r) => r.confidence));
        }
        else {
            const cleanResults = results.filter((r) => r.status === "clean");
            if (cleanResults.length > 0) {
                const avgConfidence = cleanResults.reduce((sum, r) => sum + r.confidence, 0) / cleanResults.length;
                finalConfidence = Math.round(avgConfidence);
            }
            else {
                finalConfidence = 70;
            }
        }
        const combinedDetails = {};
        results.forEach((result) => {
            if (result.details) {
                Object.assign(combinedDetails, result.details);
            }
        });
        const vtResult = results.find((r) => r.source === "VirusTotal");
        const abuseResult = results.find((r) => r.source === "AbuseIPDB");
        return {
            value: results[0].value,
            status: finalStatus,
            confidence: finalConfidence,
            threat_type: vtResult?.threat_type || abuseResult?.threat_type,
            source: sources,
            detections: Math.max(...results.map((r) => r.detections || 0)),
            country: results.find((r) => r.country)?.country,
            lastSeen: results.find((r) => r.lastSeen)?.lastSeen,
            details: {
                ...combinedDetails,
                virusTotal: vtResult?.details,
                abuseIPDB: abuseResult?.details,
                vt_malicious_score: vtResult?.details?.malicious_score,
                vt_suspicious_score: vtResult?.details?.suspicious_score,
                vt_harmless_score: vtResult?.details?.harmless_score,
                vt_total_engines: vtResult?.details?.total_engines,
                abuse_score: abuseResult?.details?.abuse_score,
            },
        };
    }
}
exports.ThreatIntelligenceService = ThreatIntelligenceService;
//# sourceMappingURL=threatIntelligenceService.js.map