export declare function getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    services: {
        api: string;
        database: string;
        cache: string;
    };
    ai: {
        providers: {
            local: boolean;
            availableModels: string[];
        };
        status: string;
    };
    environment: string;
}>;
//# sourceMappingURL=healthController.d.ts.map