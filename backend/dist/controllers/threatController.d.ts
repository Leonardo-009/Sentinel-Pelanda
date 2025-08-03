interface VerifyThreatsRequest {
    items: string[];
    type: "ip" | "url" | "hash" | "phishing";
}
export declare function verifyThreatsController(data: VerifyThreatsRequest): Promise<{
    items: any[];
    summary: {
        totalScanned: number;
        processingTime: string;
        sources: string[];
        errors: string[] | undefined;
    };
    total: number;
    malicious: number;
    suspicious: number;
    clean: number;
}>;
export {};
//# sourceMappingURL=threatController.d.ts.map