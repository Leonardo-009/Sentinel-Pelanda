"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localAIService = exports.LocalAIService = void 0;
const fetch = require('node-fetch');
class LocalAIService {
    constructor(baseUrl = 'http://localhost:11434', defaultModel = 'llama2') {
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
    }
    async generateResponse(prompt, model, options) {
        const requestBody = {
            model: model || this.defaultModel,
            prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                ...options
            }
        };
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return {
                text: data.response,
                usage: {
                    promptTokens: this.estimateTokens(prompt),
                    completionTokens: this.estimateTokens(data.response),
                    totalTokens: this.estimateTokens(prompt) + this.estimateTokens(data.response),
                    model: data.model,
                    duration: data.total_duration
                }
            };
        }
        catch (error) {
            console.error('Local AI Service Error:', error);
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async listModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.models?.map((model) => model.name) || [];
        }
        catch (error) {
            console.error('Error listing models:', error);
            return [];
        }
    }
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
}
exports.LocalAIService = LocalAIService;
exports.localAIService = new LocalAIService(process.env.LOCAL_AI_URL || 'http://localhost:11434', process.env.LOCAL_AI_MODEL || 'llama2');
//# sourceMappingURL=localAIService.js.map