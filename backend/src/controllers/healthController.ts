import { checkAIProviders } from "../services/aiService"

export async function getHealthStatus() {
  const timestamp = new Date().toISOString()
  
  // Verificar status dos provedores de IA
  const aiProviders = await checkAIProviders()
  
  return {
    status: "healthy",
    timestamp,
    version: "3.0.0",
    services: {
      api: "operational",
      database: "operational",
      cache: "operational"
    },
    ai: {
      providers: aiProviders,
      status: aiProviders.local ? "available" : "unavailable"
    },
    environment: process.env.NODE_ENV || "development"
  }
}
