export declare function generateAIAnalysis(prompt: string, provider: string): Promise<{
    text: string;
    usage?: any;
}>;
export declare function checkAIProviders(): Promise<{
    local: boolean;
    availableModels: string[];
}>;
//# sourceMappingURL=aiService.d.ts.map