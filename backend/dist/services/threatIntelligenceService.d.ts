export interface ThreatIntelligenceResult {
    value: string;
    status: "clean" | "suspicious" | "malicious";
    confidence: number;
    threat_type?: string;
    source: string;
    detections?: number;
    country?: string;
    lastSeen?: string;
    details?: any;
}
export declare class ThreatIntelligenceService {
    private virusTotalApiKey;
    private abuseIPDBApiKey;
    private urlscanApiKey;
    constructor();
    checkVirusTotal(indicator: string, type: "ip" | "url" | "hash"): Promise<ThreatIntelligenceResult | null>;
    checkAbuseIPDB(ip: string): Promise<ThreatIntelligenceResult | null>;
    checkPhishing(url: string): Promise<ThreatIntelligenceResult | null>;
    checkIndicator(indicator: string, type: "ip" | "url" | "hash"): Promise<ThreatIntelligenceResult[]>;
    checkPhishingBatch(urls: string[]): Promise<ThreatIntelligenceResult[]>;
    combineResults(results: ThreatIntelligenceResult[]): ThreatIntelligenceResult;
}
//# sourceMappingURL=threatIntelligenceService.d.ts.map