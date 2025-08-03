interface AnalyzeRequest {
    logText: string;
    provider: string;
    reportType: string;
    prompt?: string;
}
export declare function analyzeLogController(data: AnalyzeRequest): Promise<any>;
export {};
//# sourceMappingURL=analyzeController.d.ts.map