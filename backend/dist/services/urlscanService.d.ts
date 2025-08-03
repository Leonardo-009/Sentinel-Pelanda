interface PhishingAnalysisResult {
    value: string;
    status: 'malicious' | 'suspicious' | 'clean';
    confidence: number;
    detections: number;
    source: string;
    details: {
        screenshot?: string;
        scan_id: string;
        phishing_score: number;
        brand_detected?: string;
        certificate_info?: {
            valid: boolean;
            issuer?: string;
            subject?: string;
        };
        domain_age?: number;
        technologies?: string[];
        redirects?: string[];
        suspicious_forms?: number;
        external_links?: number;
        error_message?: string;
        urlscan_links: {
            result_url: string;
            screenshot_url?: string;
            dom_url?: string;
        };
        network_info: {
            ips: string[];
            domains: string[];
            countries: string[];
            asns: string[];
            servers: string[];
        };
        page_info: {
            title?: string;
            domain: string;
            ip?: string;
            country?: string;
            city?: string;
            server?: string;
            asn?: string;
            asnname?: string;
        };
        statistics: {
            requests: number;
            unique_ips: number;
            unique_countries: number;
            data_length: number;
        };
        verdicts_detail: {
            urlscan: {
                score: number;
                malicious: boolean;
                categories: string[];
                brands: string[];
            };
            engines: {
                score: number;
                malicious: boolean;
                categories: string[];
                brands: string[];
            };
            community: {
                score: number;
                malicious: boolean;
                votes_malicious: number;
                votes_harmless: number;
                votes_total: number;
            };
        };
        overall_verdict: {
            score: number;
            malicious: boolean;
            categories: string[];
            brands: string[];
        };
    };
}
declare class URLScanService {
    private apiKey;
    private baseUrl;
    constructor();
    private submitURL;
    private getResult;
    private getScreenshot;
    private waitForResult;
    private calculatePhishingScore;
    private determineStatus;
    private extractTechnologies;
    private countSuspiciousForms;
    analyzeURL(url: string): Promise<PhishingAnalysisResult>;
    analyzeMultipleURLs(urls: string[]): Promise<PhishingAnalysisResult[]>;
    isConfigured(): boolean;
}
export declare const urlscanService: URLScanService;
export type { PhishingAnalysisResult };
//# sourceMappingURL=urlscanService.d.ts.map