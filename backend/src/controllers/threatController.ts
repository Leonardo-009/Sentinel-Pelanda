import { createHash } from "crypto"
import { cacheService } from "../services/cacheService"
import { ThreatIntelligenceService } from "../services/threatIntelligenceService"

interface VerifyThreatsRequest {
  items: string[]
  type: "ip" | "url" | "hash" | "phishing"
}

const threatService = new ThreatIntelligenceService()

export async function verifyThreatsController(data: VerifyThreatsRequest) {
  const { items, type } = data
  const startTime = Date.now()
  const results = []
  const errors = []

  for (const item of items) {
    try {
      const trimmedItem = item.trim()
      if (!trimmedItem) continue

      // Check cache first
      const cacheKey = `threat-${type}-${createHash("md5").update(trimmedItem).digest("hex")}`
      const cachedResult = cacheService.get(cacheKey)

      if (cachedResult) {
        results.push({ ...cachedResult, cached: true })
        continue
      }

      // Validate indicator format
      if (!validateIndicator(trimmedItem, type)) {
        errors.push(`Invalid ${type} format: ${trimmedItem}`)
        continue
      }

      // Query threat intelligence APIs
      let combinedResult
      
      if (type === "phishing") {
        // Use URLScan for phishing analysis
        combinedResult = await threatService.checkPhishing(trimmedItem)
        
        // checkPhishing agora sempre retorna um resultado, nunca null
        if (!combinedResult) {
          // Fallback extremo (não deveria acontecer)
          combinedResult = {
            value: trimmedItem,
            status: "clean" as const,
            confidence: 0,
            source: "URLScan Error",
            details: "Unexpected null result from URLScan service"
          }
        }
      } else {
        // Use regular threat intelligence for other types
        const threatResults = await threatService.checkIndicator(trimmedItem, type)
        combinedResult = threatService.combineResults(threatResults)
      }

      // Cache for 4 hours
      cacheService.set(cacheKey, combinedResult, 14400)

      results.push(combinedResult)

      // Rate limiting - small pause between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      errors.push(`Error checking ${item}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const processingTime = ((Date.now() - startTime) / 1000).toFixed(1)

  // Calculate statistics
  const stats = {
    total: results.length,
    malicious: results.filter((r) => r.status === "malicious").length,
    suspicious: results.filter((r) => r.status === "suspicious").length,
    clean: results.filter((r) => r.status === "clean").length,
  }

  return {
    ...stats,
    items: results,
    summary: {
      totalScanned: results.length,
      processingTime: `${processingTime}s`,
      sources: type === "phishing" ? ["URLScan.io"] : ["VirusTotal", "AbuseIPDB"],
      errors: errors.length > 0 ? errors : undefined,
    },
  }
}

function validateIndicator(indicator: string, type: string): boolean {
  switch (type) {
    case "ip":
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      return ipv4Regex.test(indicator) || ipv6Regex.test(indicator)

    case "url":
    case "phishing":
      try {
        new URL(indicator)
        return true
      } catch {
        return false
      }

    case "hash":
      const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/
      return hashRegex.test(indicator)

    default:
      return false
  }
}
