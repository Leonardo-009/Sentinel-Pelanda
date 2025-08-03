const fetch = require('node-fetch')

interface LocalAIRequest {
  model: string
  prompt: string
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    repeat_penalty?: number
    seed?: number
    num_predict?: number
    stop?: string[]
  }
}

interface LocalAIResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_duration?: number
  eval_duration?: number
}

export class LocalAIService {
  private baseUrl: string
  private defaultModel: string

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'llama2') {
    this.baseUrl = baseUrl
    this.defaultModel = defaultModel
  }

  async generateResponse(prompt: string, model?: string, options?: any): Promise<{ text: string; usage?: any }> {
    const requestBody: LocalAIRequest = {
      model: model || this.defaultModel,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        ...options
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as LocalAIResponse

      return {
        text: data.response,
        usage: {
          promptTokens: this.estimateTokens(prompt),
          completionTokens: this.estimateTokens(data.response),
          totalTokens: this.estimateTokens(prompt) + this.estimateTokens(data.response),
          model: data.model,
          duration: data.total_duration
        }
      }
    } catch (error) {
      console.error('Local AI Service Error:', error)
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      return data.models?.map((model: any) => model.name) || []
    } catch (error) {
      console.error('Error listing models:', error)
      return []
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch (error) {
      return false
    }
  }

  private estimateTokens(text: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4)
  }
}

// Instância singleton
export const localAIService = new LocalAIService(
  process.env.LOCAL_AI_URL || 'http://localhost:11434',
  process.env.LOCAL_AI_MODEL || 'llama2'
) 