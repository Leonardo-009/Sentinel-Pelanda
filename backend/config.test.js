// Configuração temporária para testes
// Copie este conteúdo para o arquivo .env do backend

module.exports = {
  PORT: 3001,
  NODE_ENV: 'development',
  FRONTEND_URL: 'http://localhost:3000',
  
  // Para testar sem API keys reais, você pode usar valores de teste
  // mas as funcionalidades de IA não funcionarão
  OPENAI_API_KEY: 'sk-your-openai-api-key-here',
  AZURE_OPENAI_API_KEY: 'your-azure-openai-api-key-here',
  AZURE_OPENAI_ENDPOINT: 'https://your-resource.openai.azure.com/',
  ANTHROPIC_API_KEY: 'sk-ant-your-anthropic-api-key-here',
  
  // Para testar sem API keys reais, você pode usar valores de teste
  // mas as verificações de ameaças não funcionarão
  VIRUSTOTAL_API_KEY: 'your-virustotal-api-key-here',
  ABUSEIPDB_API_KEY: 'your-abuseipdb-api-key-here',
  
  CACHE_TTL: 3600,
  CACHE_CHECK_PERIOD: 600
}; 