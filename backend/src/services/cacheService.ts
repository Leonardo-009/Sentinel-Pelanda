import NodeCache from "node-cache"

class CacheService {
  private cache: NodeCache

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // Default 1 hour
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false,
    })
  }

  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? 3600)
  }

  get(key: string): any {
    return this.cache.get(key)
  }

  del(key: string): number {
    return this.cache.del(key)
  }

  flushAll(): void {
    this.cache.flushAll()
  }

  flushByPattern(pattern: string): void {
    const keys = this.cache.keys()
    const regex = new RegExp(pattern.replace("*", ".*"))

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.del(key)
      }
    })
  }

  keys(): string[] {
    return this.cache.keys()
  }

  getStats(): any {
    return this.cache.getStats()
  }
}

export const cacheService = new CacheService()
