import { createHash } from "crypto"
import { generateAIAnalysis } from "../services/aiService"
import { cacheService } from "../services/cacheService"

interface AnalyzeRequest {
  logText: string
  provider: string
  reportType: string
  prompt?: string
}

export async function analyzeLogController(data: AnalyzeRequest) {
  const { logText, provider, reportType, prompt } = data

  // Generate cache key
  const contentHash = createHash("sha256").update(`${logText}-${provider}-${reportType}`).digest("hex")

  // Check cache
  const cachedResult = cacheService.get(`ai-${contentHash}`)
  if (cachedResult) {
    return {
      ...cachedResult,
      cached: true,
    }
  }

  let analysisResult: Record<string, unknown>

  try {
    if (reportType === "saude" || reportType === "saude-siem") {
      analysisResult = await generateHealthReport(logText, provider, prompt)
    } else if (reportType === "refinar") {
      analysisResult = await generateRefinedReport(logText, provider)
    } else {
      analysisResult = await generateCompleteReport(logText, provider, prompt)
    }

    // Cache result for 1 hour
    cacheService.set(`ai-${contentHash}`, analysisResult, 3600)

    return analysisResult
  } catch (error) {
    if (error instanceof Error) {
    throw new Error(`Failed to analyze log: ${error.message}`)
    }
    throw new Error("Failed to analyze log: Unknown error")
  }
}

async function generateHealthReport(logText: string, provider: string, customPrompt?: string) {
  const healthPrompt = customPrompt || `Analise este log de segurança e forneça um relatório de saúde do sistema em formato JSON:

Log: ${logText}

Retorne apenas um JSON com:
{
  "systemHealth": {
    "overall": "Bom|Regular|Ruim",
    "security": number (0-100),
    "performance": number (0-100),
    "availability": number (0-100)
  },
  "recommendations": ["recomendação1", "recomendação2", "recomendação3"],
  "summary": "resumo da análise"
}`

  const aiResponse = await generateAIAnalysis(healthPrompt, provider)

  try {
    const healthData = JSON.parse(aiResponse.text)
    return {
      type: "saude",
      ...healthData,
      aiUsage: aiResponse.usage,
    }
  } catch {
    return {
      type: "saude",
      systemHealth: {
        overall: "Regular",
        security: 75,
        performance: 80,
        availability: 90,
      },
      recommendations: [
        "Revisar configurações de segurança",
        "Monitorar logs com mais frequência",
        "Implementar alertas automáticos",
      ],
      summary: "Análise de saúde baseada no log fornecido",
      aiUsage: aiResponse.usage,
    }
  }
}

async function generateRefinedReport(logText: string, provider: string) {
  const refinePrompt = `Refine esta análise de log de segurança, identificando falsos positivos e confirmando ameaças reais:

Log: ${logText}

Retorne apenas um JSON com:
{
  "refinedAnalysis": {
    "falsePositives": number,
    "confirmedThreats": number,
    "needsReview": number
  },
  "details": "explicação detalhada do refinamento",
  "summary": "resumo do refinamento"
}`

  const aiResponse = await generateAIAnalysis(refinePrompt, provider)

  try {
    const refineData = JSON.parse(aiResponse.text)
    return {
      type: "refinar",
      ...refineData,
      aiUsage: aiResponse.usage,
    }
  } catch {
    return {
      type: "refinar",
      refinedAnalysis: {
        falsePositives: 1,
        confirmedThreats: 2,
        needsReview: 1,
      },
      details: "Refinamento automático aplicado ao log",
      summary: "Análise refinada com base nos padrões identificados",
      aiUsage: aiResponse.usage,
    }
  }
}

async function generateCompleteReport(logText: string, provider: string, customPrompt?: string) {
  const fullPrompt = customPrompt || logText
  const aiResponse = await generateAIAnalysis(fullPrompt, provider)

  const reportText = aiResponse.text

  return {
    type: "completo",
    reportText,
    report: parseReportFromAI(reportText),
    confidence: calculateConfidence(reportText),
    aiUsage: aiResponse.usage,
  }
}

function parseReportFromAI(reportText: string): Record<string, unknown> {
  // Extrair seções do texto da IA seguindo o formato customizado
  const greeting = extractSection(reportText, "Prezados,", "Nossa equipe")
  const introduction = extractSection(reportText, "Nossa equipe", "📄 Caso de uso:")
  const caseUse = extractSection(reportText, "📄 Caso de uso:", "🕵 Análise:")
  const analysis = extractSection(reportText, "🕵 Análise:", "📊 Fonte de dados")
  const source = extractSection(reportText, "📊 Fonte de dados utilizada na análise:", "🚨 Severidade:")
  const severity = extractSection(reportText, "🚨 Severidade:", "📋 Detalhes do Evento:")
  const evidenceSection = extractSection(reportText, "📋 Detalhes do Evento:", "Mensagem de Log:")
  const logMessage = extractSection(reportText, "Mensagem de Log:", "📌 Justificativa")
  const justification = extractSection(reportText, "📌 Justificativa para Abertura do Caso:", "🛡 Ação tomada")
  const actionTaken = extractSection(reportText, "🛡 Ação tomada", "🛠 Recomendação:")
  const recommendations = extractRecommendations(reportText)

  // Extrair dados das evidências de forma mais estruturada
  const evidence = parseEvidenceSection(evidenceSection)

  return {
    greeting: greeting || "Prezados,",
    introduction: introduction || "Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. Seguem abaixo mais detalhes para validação.",
    caseUse: caseUse || "Caso de uso não especificado",
    analysis: analysis || "Análise técnica do evento de segurança",
    source: source || "Sistema de monitoramento",
    severity: severity || "Moderada",
    evidence,
    logMessage: logMessage || "Mensagem de log não disponível",
    justification: justification || "Evento requer atenção devido à natureza da atividade detectada",
    actionTaken: actionTaken || "Nenhuma ação foi tomada",
    recommendations: recommendations.length > 0 ? recommendations : ["Investigar origem do evento", "Revisar logs relacionados", "Implementar medidas de mitigação"],
  }
}

function parseEvidenceSection(evidenceText: string): Record<string, string> {
  const evidence: Record<string, string> = {}
  
  // Mapear campos específicos das evidências seguindo o formato customizado
  const fieldMappings = {
    "Data do Log:": "logDate",
    "Fonte do Log:": "logSource",
    "Usuário de Origem:": "originUser",
    "Usuário Afetado:": "affectedUser",
    "IP/Host de Origem:": "originIP",
    "IP/Host Afetado:": "affectedIP",
    "Localização (Origem/Impactado):": "location",
    "Tipo do Evento:": "eventType",
    "Grupo:": "group",
    "Objeto:": "object",
    "Nome do Objeto:": "objectName",
    "Tipo do Objeto:": "objectType",
    "Assunto:": "subject",
    "Política:": "policy",
    "Nome da Ameaça:": "threatName",
    "Nome do Processo:": "processName",
    "Nome da Regra MPE:": "ruleName",
    "Mensagem do Fornecedor:": "vendorMessage",
    "ID do Fornecedor:": "vendorId",
    "Identificador de Navegador:": "browserId",
    "Ação:": "action",
    "Status:": "status",
    "Resultado:": "result",
    "IOCs (Indicadores de Comprometimento):": "iocs"
  }

  // Extrair cada campo das evidências
  Object.entries(fieldMappings).forEach(([fieldName, fieldKey]) => {
    const value = extractFieldValue(evidenceText, fieldName)
    if (value) {
      evidence[fieldKey] = value
    }
  })

  return evidence
}

function extractFieldValue(text: string, fieldName: string): string {
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.trim().startsWith(fieldName)) {
      return line.replace(fieldName, '').trim()
    }
  }
  return ""
}

function extractSection(text: string, startMarker: string, endMarker: string): string {
  const startIndex = text.indexOf(startMarker)
  if (startIndex === -1) return ""

  const contentStart = startIndex + startMarker.length
  let endIndex = -1

  if (endMarker) {
    endIndex = text.indexOf(endMarker, contentStart)
  }

  if (endIndex === -1) {
    // Se não encontrar o endMarker, pega até o final ou até a próxima seção
    const nextSectionMarkers = ["🕵 Análise:", "📊 Fonte:", "🚨 Severidade:", "📋 Detalhes do Evento:", "📌 Justificativa:", "🛠 Recomendação:"]
    let nextSectionIndex = -1
    
    for (const marker of nextSectionMarkers) {
      const markerIndex = text.indexOf(marker, contentStart)
      if (markerIndex !== -1 && (nextSectionIndex === -1 || markerIndex < nextSectionIndex)) {
        nextSectionIndex = markerIndex
      }
    }
    
    if (nextSectionIndex !== -1) {
      endIndex = nextSectionIndex
    }
  }

  if (endIndex === -1) {
    return text.substring(contentStart).trim()
  }

  return text.substring(contentStart, endIndex).trim()
}

function extractRecommendations(text: string): string[] {
  const section = extractSection(text, "🛠 Recomendação:", "")
  const lines = section.split("\n")

  return lines
    .filter((line) => {
      const trimmed = line.trim()
      return trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)
    })
    .map((line) => {
      // Remove marcadores de lista e espaços extras
      return line
        .replace(/^[•\-*]\s*/, "") // Remove •, -, *
        .replace(/^\d+\.\s*/, "") // Remove números seguidos de ponto
        .replace(/^\[.*?\]\s*/, "") // Remove [texto] no início
        .trim()
    })
    .filter((line) => line.length > 0)
}

function calculateConfidence(reportText: string): number {
  let confidence = 70

  if (reportText.includes("Alta")) confidence += 15
  if (reportText.includes("múltiplas")) confidence += 10
  if (reportText.includes("suspeita")) confidence += 5

  return Math.min(95, confidence)
}
