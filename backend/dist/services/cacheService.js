"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    constructor() {
        this.cache = new node_cache_1.default({
            stdTTL: 3600,
            checkperiod: 600,
            useClones: false,
        });
    }
    set(key, value, ttl) {
        return this.cache.set(key, value, ttl ?? 3600);
    }
    get(key) {
        return this.cache.get(key);
    }
    del(key) {
        return this.cache.del(key);
    }
    flushAll() {
        this.cache.flushAll();
    }
    flushByPattern(pattern) {
        const keys = this.cache.keys();
        const regex = new RegExp(pattern.replace("*", ".*"));
        keys.forEach((key) => {
            if (regex.test(key)) {
                this.cache.del(key);
            }
        });
    }
    keys() {
        return this.cache.keys();
    }
    getStats() {
        return this.cache.getStats();
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map