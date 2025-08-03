export declare class LocalAIService {
    private baseUrl;
    private defaultModel;
    constructor(baseUrl?: string, defaultModel?: string);
    generateResponse(prompt: string, model?: string, options?: any): Promise<{
        text: string;
        usage?: any;
    }>;
    listModels(): Promise<string[]>;
    checkHealth(): Promise<boolean>;
    private estimateTokens;
}
export declare const localAIService: LocalAIService;
//# sourceMappingURL=localAIService.d.ts.map