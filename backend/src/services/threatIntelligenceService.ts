export interface ThreatIntelligenceResult {
  value: string
  status: "clean" | "suspicious" | "malicious"
  confidence: number
  threat_type?: string
  source: string
  detections?: number
  country?: string
  lastSeen?: string
  details?: any
}

export class ThreatIntelligenceService {
  private virusTotalApiKey: string
  private abuseIPDBApiKey: string
  private urlscanApiKey: string

  constructor() {
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY || ""
    this.abuseIPDBApiKey = process.env.ABUSEIPDB_API_KEY || ""
    this.urlscanApiKey = process.env.URLSCAN_API_KEY || ""
  }

  async checkVirusTotal(indicator: string, type: "ip" | "url" | "hash"): Promise<ThreatIntelligenceResult | null> {
    if (!this.virusTotalApiKey) {
      console.log("VirusTotal API key not configured, skipping VirusTotal check")
      return null
    }

    try {
      let endpoint = ""
      let encodedIndicator = indicator

      switch (type) {
        case "ip":
          endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`
          break
        case "url":
          encodedIndicator = Buffer.from(indicator).toString("base64").replace(/=/g, "")
          endpoint = `https://www.virustotal.com/api/v3/urls/${encodedIndicator}`
          break
        case "hash":
          endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`
          break
      }

      const response = await fetch(endpoint, {
        headers: {
          "X-Apikey": this.virusTotalApiKey,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return {
            value: indicator,
            status: "clean",
            confidence: 50,
            source: "VirusTotal",
            details: "Not found in database",
          }
        }
        throw new Error(`VirusTotal API error: ${response.status}`)
      }

      const data = await response.json() as any
      const stats = data.data.attributes.last_analysis_stats

      const malicious = stats.malicious || 0
      const suspicious = stats.suspicious || 0
      const total = malicious + suspicious + (stats.undetected || 0) + (stats.harmless || 0)

      let status: "clean" | "suspicious" | "malicious" = "clean"
      let confidence = 50

      if (malicious > 0) {
        status = "malicious"
        confidence = Math.min(95, 60 + (malicious / total) * 35)
      } else if (suspicious > 0) {
        status = "suspicious"
        confidence = Math.min(80, 40 + (suspicious / total) * 40)
      } else {
        // Para itens limpos, a confiança deve ser alta (indicando que é confiável)
        // Quanto mais análises harmless, maior a confiança (mais confiável)
        const harmlessRatio = (stats.harmless || 0) / total
        const undetectedRatio = (stats.undetected || 0) / total
        
        // Base da confiança: 70% para itens limpos
        // Aumenta com mais análises harmless, diminui com mais undetected
        confidence = Math.max(60, Math.min(95, 70 + (harmlessRatio * 25) - (undetectedRatio * 15)))
      }

      // Extrair informações adicionais
      let threatType = undefined
      if (data.data.attributes.tags && data.data.attributes.tags.length > 0) {
        threatType = data.data.attributes.tags[0]
      }

      return {
        value: indicator,
        status,
        confidence: Math.round(confidence),
        threat_type: threatType,
        source: "VirusTotal",
        detections: malicious + suspicious,
        country: data.data.attributes.country,
        lastSeen: data.data.attributes.last_seen,
        details: {
          last_analysis_stats: stats,
          tags: data.data.attributes.tags,
          reputation: data.data.attributes.reputation,
          as_owner: data.data.attributes.as_owner,
          continent: data.data.attributes.continent,
          city: data.data.attributes.city,
          // Adicionar scores originais
          malicious_score: malicious,
          suspicious_score: suspicious,
          harmless_score: stats.harmless || 0,
          undetected_score: stats.undetected || 0,
          total_engines: total,
        },
      }
    } catch {
      // console.error("VirusTotal query error:", error)
      return null
    }
  }

  async checkAbuseIPDB(ip: string): Promise<ThreatIntelligenceResult | null> {
    if (!this.abuseIPDBApiKey) {
      // console.log("AbuseIPDB API key not configured, skipping AbuseIPDB check")
      return null
    }

    try {
      const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
        headers: {
          Key: this.abuseIPDBApiKey,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`AbuseIPDB API error: ${response.status}`)
      }

      const result = await response.json() as any
      const data = result.data

      let status: "clean" | "suspicious" | "malicious" = "clean"
      const abuseConfidence = data.abuseConfidenceScore

      if (abuseConfidence >= 75) {
        status = "malicious"
      } else if (abuseConfidence >= 25) {
        status = "suspicious"
      }

      // Para AbuseIPDB, a confiança é o score de abuso
      // Para itens limpos, vamos inverter a lógica para ser mais intuitiva
      let finalConfidence = abuseConfidence
      if (status === "clean") {
        // Para itens limpos, confiança alta = mais confiável
        finalConfidence = Math.max(70, 100 - abuseConfidence)
      }

      // Determinar tipo de ameaça baseado nos relatórios
      let threatType = undefined
      if (data.reports && data.reports.length > 0) {
        const reportTypes = data.reports.map((report: any) => report.type).filter((type: string) => type)
        if (reportTypes.length > 0) {
          threatType = reportTypes[0]
        }
      }

      return {
        value: ip,
        status,
        confidence: finalConfidence,
        threat_type: threatType,
        source: "AbuseIPDB",
        country: data.countryCode,
        lastSeen: data.lastReportedAt,
        details: {
          abuseConfidence,
          totalReports: data.totalReports,
          isPublic: data.isPublic,
          isp: data.isp,
          domain: data.domain,
          hostnames: data.hostnames,
          usageType: data.usageType,
          reports: data.reports,
          // Adicionar score original
          abuse_score: abuseConfidence,
        },
      }
    } catch {
      // console.error("AbuseIPDB query error:", error)
      return null
    }
  }

  async checkPhishing(url: string): Promise<ThreatIntelligenceResult | null> {
    console.log("Checking phishing for URL:", url);
    console.log("URLScan API Key configured:", !!this.urlscanApiKey);
    
    if (!this.urlscanApiKey) {
      console.log("URLScan API key not configured, skipping phishing check")
      return {
        value: url,
        status: "clean",
        confidence: 0,
        source: "URLScan not configured",
        details: {
          error_message: "URLScan API key not configured in environment variables"
        }
      }
    }

    try {
      // Import URLScan service
      const { urlscanService } = await import('./urlscanService')
      
      if (!urlscanService.isConfigured()) {
        console.log("URLScan service not configured");
        return {
          value: url,
          status: "clean",
          confidence: 0,
          source: "URLScan not configured",
          details: {
            error_message: "URLScan service not properly configured"
          }
        }
      }

      console.log("Calling URLScan service for URL:", url);
      const result = await urlscanService.analyzeURL(url)
      console.log("URLScan result received:", result.source, result.status);
      
      return {
        value: result.value,
        status: result.status,
        confidence: result.confidence,
        threat_type: result.details.brand_detected ? `Brand Impersonation: ${result.details.brand_detected}` : undefined,
        source: result.source,
        detections: result.detections,
        details: result.details
      }
    } catch (error) {
      console.error("URLScan phishing check error:", error)
      return {
        value: url,
        status: "clean",
        confidence: 0,
        source: "URLScan Error",
        details: {
          error_message: error instanceof Error ? error.message : "Unknown error during URLScan analysis"
        }
      }
    }
  }

  async checkIndicator(indicator: string, type: "ip" | "url" | "hash"): Promise<ThreatIntelligenceResult[]> {
    const results: ThreatIntelligenceResult[] = []

    try {
      // Try VirusTotal first
      const vtResult = await this.checkVirusTotal(indicator, type)
      if (vtResult) {
        results.push(vtResult)
      }

      // For IPs, also try AbuseIPDB
      if (type === "ip") {
        const abuseResult = await this.checkAbuseIPDB(indicator)
        if (abuseResult) {
          results.push(abuseResult)
        }
      }

      // If no results from APIs, return a default clean result
      if (results.length === 0) {
        results.push({
          value: indicator,
          status: "clean",
          confidence: 50,
          source: "No APIs available",
          details: "No threat intelligence APIs configured",
        })
      }

      return results
    } catch {
      // console.error("Indicator check error:", error)
      // Return a default result on error
      return [{
        value: indicator,
        status: "clean",
        confidence: 50,
        source: "Error",
        details: "Error checking indicator",
      }]
    }
  }

  async checkPhishingBatch(urls: string[]): Promise<ThreatIntelligenceResult[]> {
    if (!this.urlscanApiKey) {
      console.log("URLScan API key not configured, skipping phishing batch check")
      return urls.map(url => ({
        value: url,
        status: "clean" as const,
        confidence: 0,
        source: "URLScan not configured",
        details: "URLScan API key not configured"
      }))
    }

    try {
      // Import URLScan service
      const { urlscanService } = await import('./urlscanService')
      
      if (!urlscanService.isConfigured()) {
        return urls.map(url => ({
          value: url,
          status: "clean" as const,
          confidence: 0,
          source: "URLScan not configured",
          details: "URLScan API key not configured"
        }))
      }

      const results = await urlscanService.analyzeMultipleURLs(urls)
      
      return results.map(result => ({
        value: result.value,
        status: result.status,
        confidence: result.confidence,
        threat_type: result.details.brand_detected ? `Brand Impersonation: ${result.details.brand_detected}` : undefined,
        source: result.source,
        detections: result.detections,
        details: result.details
      }))
    } catch (error) {
      console.error("URLScan batch phishing check error:", error)
      return urls.map(url => ({
        value: url,
        status: "clean" as const,
        confidence: 0,
        source: "URLScan Error",
        details: "Error during URLScan analysis"
      }))
    }
  }

  combineResults(results: ThreatIntelligenceResult[]): ThreatIntelligenceResult {
    if (results.length === 0) {
      throw new Error("No results to combine")
    }

    if (results.length === 1) {
      return results[0]
    }

    const maliciousResults = results.filter((r) => r.status === "malicious")
    const suspiciousResults = results.filter((r) => r.status === "suspicious")

    let finalStatus: "clean" | "suspicious" | "malicious" = "clean"
    let finalConfidence = 50
    const sources = results.map((r) => r.source).join(", ")

    if (maliciousResults.length > 0) {
      finalStatus = "malicious"
      // Para maliciosos, usar a maior confiança (mais certeza de que é malicioso)
      finalConfidence = Math.max(...maliciousResults.map((r) => r.confidence))
    } else if (suspiciousResults.length > 0) {
      finalStatus = "suspicious"
      // Para suspeitos, usar a maior confiança (mais certeza de que é suspeito)
      finalConfidence = Math.max(...suspiciousResults.map((r) => r.confidence))
    } else {
      // Para itens limpos, usar a média das confianças (mais equilibrado)
      const cleanResults = results.filter((r) => r.status === "clean")
      if (cleanResults.length > 0) {
        const avgConfidence = cleanResults.reduce((sum, r) => sum + r.confidence, 0) / cleanResults.length
        finalConfidence = Math.round(avgConfidence)
      } else {
        finalConfidence = 70 // Confiança padrão para itens limpos
      }
    }

    // Combinar informações detalhadas
    const combinedDetails: any = {}
    results.forEach((result) => {
      if (result.details) {
        Object.assign(combinedDetails, result.details)
      }
    })

    // Preservar informações específicas de cada fonte
    const vtResult = results.find((r) => r.source === "VirusTotal")
    const abuseResult = results.find((r) => r.source === "AbuseIPDB")

    return {
      value: results[0].value,
      status: finalStatus,
      confidence: finalConfidence,
      threat_type: vtResult?.threat_type || abuseResult?.threat_type,
      source: sources,
      detections: Math.max(...results.map((r) => r.detections || 0)),
      country: results.find((r) => r.country)?.country,
      lastSeen: results.find((r) => r.lastSeen)?.lastSeen,
      details: {
        ...combinedDetails,
        virusTotal: vtResult?.details,
        abuseIPDB: abuseResult?.details,
        // Preservar scores originais
        vt_malicious_score: vtResult?.details?.malicious_score,
        vt_suspicious_score: vtResult?.details?.suspicious_score,
        vt_harmless_score: vtResult?.details?.harmless_score,
        vt_total_engines: vtResult?.details?.total_engines,
        abuse_score: abuseResult?.details?.abuse_score,
      },
    }
  }
}
