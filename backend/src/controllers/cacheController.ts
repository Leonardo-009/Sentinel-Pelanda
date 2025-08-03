import { cacheService } from "../services/cacheService"

export async function getCacheStats() {
  return {
    stats: cacheService.getStats(),
    keys: cacheService.keys(),
  }
}

export async function clearCache(type: string) {
  switch (type) {
    case "threat":
      cacheService.flushByPattern("threat-*")
      return { message: "Threat cache cleared" }

    case "ai":
      cacheService.flushByPattern("ai-*")
      return { message: "AI analysis cache cleared" }

    case "all":
      cacheService.flushAll()
      return { message: "All caches cleared" }

    default:
      throw new Error("Invalid cache type. Use: threat, ai, or all")
  }
}
