declare class CacheService {
    private cache;
    constructor();
    set(key: string, value: any, ttl?: number): boolean;
    get(key: string): any;
    del(key: string): number;
    flushAll(): void;
    flushByPattern(pattern: string): void;
    keys(): string[];
    getStats(): any;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cacheService.d.ts.map