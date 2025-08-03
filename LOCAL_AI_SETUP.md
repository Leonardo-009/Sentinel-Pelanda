# 🤖 Configuração de IA Local - Sentinel-Pelanda

## 📋 Visão Geral

O Sentinel-Pelanda utiliza **exclusivamente IA Local** usando [Ollama](https://ollama.ai), garantindo processamento offline e máxima privacidade dos dados.

## 🎯 Benefícios da IA Local

- ✅ **Processamento Offline** - Sem dependência de APIs externas
- ✅ **Privacidade Total** - Dados nunca saem do seu ambiente
- ✅ **Custo Zero** - Sem taxas de API
- ✅ **Latência Baixa** - Processamento local mais rápido
- ✅ **Controle Total** - Modelos e configurações personalizáveis
- ✅ **Segurança Máxima** - Sem transmissão de dados sensíveis

## 🚀 Instalação Rápida

### 1. Pré-requisitos

```bash
# Docker e Docker Compose
docker --version
docker-compose --version

# GPU (opcional, mas recomendado)
nvidia-smi
```

### 2. Configuração Automática

```bash
# Dar permissão ao script
chmod +x setup-local-ai.sh

# Executar setup
./setup-local-ai.sh
```

### 3. Iniciar Serviços

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

## 🔧 Configuração Manual

### 1. Instalar Ollama

#### Linux/macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
```bash
# Baixar de https://ollama.ai/download
```

### 2. Baixar Modelos

```bash
# Modelo padrão (recomendado)
ollama pull llama2

# Modelos alternativos
ollama pull codellama:7b    # Para análise de código
ollama pull mistral:7b      # Equilibrado
ollama pull neural-chat:7b  # Conversacional
```

### 3. Configurar Variáveis de Ambiente

```bash
# Backend/.env
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama2
```

## 📊 Modelos Disponíveis

### Modelos Recomendados

| Modelo | Tamanho | RAM | Uso Recomendado |
|--------|---------|-----|-----------------|
| `llama2` | 7B | 8GB | Análise geral |
| `codellama:7b` | 7B | 8GB | Análise de código |
| `mistral:7b` | 7B | 8GB | Equilibrado |
| `neural-chat:7b` | 7B | 8GB | Conversacional |

### Modelos Leves (RAM limitada)

| Modelo | Tamanho | RAM | Uso |
|--------|---------|-----|-----|
| `llama2:3b` | 3B | 4GB | Básico |
| `mistral:3b` | 3B | 4GB | Rápido |
| `phi:2.7b` | 2.7B | 3GB | Muito leve |

## 🎛️ Configuração Avançada

### 1. Otimização de Performance

```bash
# Configurar GPU (se disponível)
export CUDA_VISIBLE_DEVICES=0

# Ajustar memória
export OLLAMA_HOST=0.0.0.0:11434
```

### 2. Modelos Customizados

```bash
# Criar modelo customizado
ollama create security-analyst -f Modelfile

# Modelfile exemplo:
FROM llama2
SYSTEM Você é um analista de segurança cibernética especializado em análise de logs.
```

### 3. Configuração de Rede

```dockerfile
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## 🔍 Verificação e Testes

### 1. Verificar Status

```bash
# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Verificar modelos disponíveis
ollama list
```

### 2. Teste de Performance

```bash
# Teste básico
ollama run llama2 "Analise este log de segurança: [seu log aqui]"

# Teste de velocidade
time ollama run llama2 "Hello, world!"
```

### 3. Teste na Interface Web

1. Acesse http://localhost:3000
2. Vá para "Análise de Logs"
3. Selecione "IA Local (Ollama)" como provedor
4. Cole um log de teste
5. Clique em "Analisar Log"

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Ollama não inicia
```bash
# Verificar logs
docker-compose logs ollama

# Reiniciar serviço
docker-compose restart ollama
```

#### 2. Modelo não encontrado
```bash
# Baixar modelo novamente
docker-compose exec ollama ollama pull llama2

# Verificar modelos disponíveis
docker-compose exec ollama ollama list
```

#### 3. Erro de memória
```bash
# Usar modelo menor
export LOCAL_AI_MODEL=llama2:3b

# Aumentar swap (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. GPU não detectada
```bash
# Verificar drivers NVIDIA
nvidia-smi

# Instalar drivers se necessário
# Ubuntu: sudo apt install nvidia-driver-xxx
# CentOS: sudo yum install nvidia-driver
```

### Logs e Debug

```bash
# Ver logs do Ollama
docker-compose logs -f ollama

# Ver logs do backend
docker-compose logs -f backend

# Testar conectividade
curl http://localhost:11434/api/generate -d '{"model":"llama2","prompt":"test"}'
```

## 📈 Monitoramento

### 1. Métricas de Performance

```bash
# Uso de memória
docker stats ollama

# Logs de performance
docker-compose logs ollama | grep "duration"
```

### 2. Health Check

```bash
# Verificar saúde da aplicação
curl http://localhost:3001/api/health

# Verificar provedores disponíveis
curl http://localhost:3001/api/health | jq '.ai.providers'
```

## 🔒 Segurança

### 1. Configurações de Segurança

```bash
# Restringir acesso à API
export OLLAMA_HOST=127.0.0.1:11434

# Usar HTTPS (se necessário)
# Configurar proxy reverso com SSL
```

### 2. Isolamento de Rede

```dockerfile
# docker-compose.yml
services:
  ollama:
    networks:
      - internal
    expose:
      - "11434"

networks:
  internal:
    internal: true
```

## 🚀 Deploy em Produção

### 1. Configuração de Produção

```bash
# Usar modelo otimizado
export LOCAL_AI_MODEL=llama2:7b

# Configurar recursos
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Backup de Modelos

```bash
# Backup dos modelos
docker run --rm -v ollama_data:/root/.ollama -v $(pwd):/backup alpine tar czf /backup/ollama-models.tar.gz /root/.ollama

# Restore dos modelos
docker run --rm -v ollama_data:/root/.ollama -v $(pwd):/backup alpine tar xzf /backup/ollama-models.tar.gz -C /
```

## 📚 Recursos Adicionais

- [Documentação Ollama](https://ollama.ai/docs)
- [Modelos Disponíveis](https://ollama.ai/library)
- [Performance Tips](https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md)
- [GPU Setup](https://ollama.ai/docs/gpu)

## 🤝 Suporte

- **Issues**: Abra uma issue no repositório
- **Discord**: [Ollama Community](https://discord.gg/ollama)
- **Documentação**: [Sentinel-Pelanda Docs](https://github.com/seu-usuario/sentinel-pelanda)

---

**Sentinel-Pelanda** - IA Local Exclusiva para Análise de Segurança Cibernética 