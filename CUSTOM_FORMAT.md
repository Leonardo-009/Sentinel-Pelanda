# 📄 Formato Customizado de Relatório - Sentinel-Pelanda

## 🎯 Visão Geral

O Sentinel-Pelanda utiliza um **formato customizado padronizado** para gerar relatórios de análise de segurança, garantindo consistência e profissionalismo em todas as análises. O sistema utiliza **exclusivamente IA Local** para máxima privacidade e segurança, processando dados completos sem ofuscação.

## 📋 Estrutura do Relatório

### Cabeçalho
```
Prezados, (uma saudação).

Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. Seguem abaixo mais detalhes para validação.
```

### Seções Principais

#### 📄 Caso de uso
Descrição clara e concisa do tipo de evento detectado.

**Exemplo:** "Tentativa de Autenticação com Nome de Usuário Inválido"

#### 🕵 Análise
Análise técnica do evento de segurança, explicando o que foi detectado e suas implicações.

#### 📊 Fonte de dados utilizada na análise
Identificação da origem dos dados analisados.

**Exemplos:**
- Microsoft-Windows-Security-Auditing
- Syslog
- Check Point SmartDefense
- Firewall Logs

#### 🚨 Severidade
Classificação da gravidade do evento:

- **Baixa**: Eventos informativos, sem risco imediato
- **Moderada**: Eventos suspeitos que requerem atenção
- **Alta**: Eventos críticos que podem indicar comprometimento
- **Crítica**: Eventos que indicam comprometimento confirmado

### 📋 Detalhes do Evento

Esta seção contém todos os campos técnicos extraídos do log:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Data do Log** | Data e hora do evento | 2024-01-15 14:30:22 |
| **Fonte do Log** | Sistema que gerou o log | Microsoft-Windows-Security-Auditing |
| **Usuário de Origem** | Usuário que iniciou a ação | admin@company.com |
| **Usuário Afetado** | Usuário impactado pela ação | admin@company.com |
| **IP/Host de Origem** | IP ou host de origem | 192.168.1.100 |
| **IP/Host Afetado** | IP ou host impactado | SRV-WEB-01 |
| **Localização** | Localização geográfica ou lógica | Rede interna |
| **Tipo do Evento** | Categoria do evento | Falha de autenticação |
| **Grupo** | Grupo de segurança | Segurança |
| **Objeto** | Recurso alvo | Sistema de autenticação |
| **Nome do Objeto** | Nome específico do recurso | lsass.exe |
| **Tipo do Objeto** | Tipo de recurso | Processo |
| **Assunto** | Resumo do evento | Tentativa de login com credenciais inválidas |
| **Política** | Política relacionada | Política de autenticação |
| **Nome da Ameaça** | Nome da ameaça detectada | Tentativa de acesso não autorizado |
| **Nome do Processo** | Processo envolvido | lsass.exe |
| **Nome da Regra MPE** | Regra que disparou o alerta | N/A |
| **Mensagem do Fornecedor** | Mensagem de erro do sistema | Unknown user name or bad password |
| **ID do Fornecedor** | Identificador único | 4625 |
| **Identificador de Navegador** | User-agent | N/A |
| **Ação** | Ação tomada pelo sistema | Detect |
| **Status** | Status da ação | Falha |
| **Resultado** | Resultado final | Login negado |
| **IOCs** | Indicadores de Comprometimento | IP 192.168.1.100, usuário admin@company.com |

### Mensagem de Log
Mensagem original do log ou resumo da informação mais relevante.

### 📌 Justificativa para Abertura do Caso
Explicação detalhada de por que o evento merece atenção, considerando:

- Gravidade do evento
- Contexto da ocorrência
- Possíveis riscos
- Relação com políticas de segurança
- Recorrência do padrão

### 🛡 Ação tomada
Descrição das ações já executadas pelo sistema ou equipe de segurança.

**Exemplos:**
- "IP bloqueado automaticamente por 24 horas"
- "Usuário notificado sobre tentativa de acesso"
- "Nenhuma ação foi tomada automaticamente"

### 🛠 Recomendação
Lista de recomendações específicas e acionáveis para:

- Investigação adicional
- Mitigação de riscos
- Melhorias de segurança
- Políticas e procedimentos

## 🔧 Configuração

### Prompts Customizados

O sistema usa prompts específicos para garantir o formato correto com IA Local:

#### Prompt Principal
```javascript
const securePrompt = `Você é um analista sênior de segurança cibernética. 
Analise o log abaixo e gere um relatório detalhado.

IMPORTANTE: Gere o relatório EXATAMENTE no formato especificado abaixo.

FORMATO OBRIGATÓRIO DO RELATÓRIO:

Prezados, (uma saudação).

Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. 
Seguem abaixo mais detalhes para validação.

📄 Caso de uso: [Descrição do caso de uso baseado no log]

🕵 Análise: [Análise técnica do evento de segurança]

📊 Fonte de dados utilizada na análise: [Identifique a fonte do log]

🚨 Severidade: [Classifique a severidade: Baixa, Moderada, Alta, Crítica]

📋 Detalhes do Evento:

Data do Log: [Data e hora do evento]
Fonte do Log: [Sistema ou componente que gerou o log]
Usuário de Origem: [Usuário associado, se aplicável]
Usuário Afetado: [Usuário impactado, se aplicável]
IP/Host de Origem: [IP ou host que gerou o evento]
IP/Host Afetado: [IP ou host impactado]
Localização (Origem/Impactado): [Localização geográfica ou lógica, se disponível]
Tipo do Evento: [Tipo de evento, ex.: tentativa de exploração, falha de autenticação]
Grupo: [Categoria do evento, ex.: SmartDefense, Firewall]
Objeto: [Recurso alvo, ex.: SNMP, HTTP]
Nome do Objeto: [Nome específico do recurso, ex.: bsnmpd]
Tipo do Objeto: [Tipo de recurso, ex.: Serviço, Aplicação]
Assunto: [Resumo do evento, ex.: SNMP Protection Violation]
Política: [Política ou configuração relevante, se aplicável]
Nome da Ameaça: [Nome da ameaça detectada, ex.: FreeBSD bsnmpd GETBULK PDU Stack Buffer Overflow]
Nome do Processo: [Processo envolvido, ex.: bsnmpd]
Nome da Regra MPE: [Regra que disparou o alerta, se aplicável]
Mensagem do Fornecedor: [Mensagem ou código de erro do sistema]
ID do Fornecedor: [Identificador único do evento, se disponível]
Identificador de Navegador: [User-agent, se aplicável]
Ação: [Ação tomada, ex.: Detect, Block, Alert]
Status: [Status da ação, ex.: Bloqueado, Falha, Sucesso]
Resultado: [Resultado final, se aplicável]
IOCs (Indicadores de Comprometimento): [Liste os IOCs identificados, se houver]

Mensagem de Log: [Mensagem original do log ou resumo]

📌 Justificativa para Abertura do Caso: [Explique por que este evento merece atenção]

🛡 Ação tomada (caso tenha sido realizado o bloqueio de IP ou URL maliciosa, descrever brevemente a ação executada): [Descreva ações tomadas, se houver]

🛠 Recomendação: [Liste recomendações específicas e acionáveis]

Lembre-se: Mantenha o formato exato especificado acima e preencha apenas os campos para os quais há informações disponíveis no log.`;
```

#### Prompt para Saúde de SIEM
```javascript
const SAUDE_SIEM_PROMPT = `Você é um analista de segurança cibernética especializado em monitoramento e manutenção da saúde de sistemas SIEM.

IMPORTANTE: Gere o relatório EXATAMENTE no formato especificado abaixo.

FORMATO OBRIGATÓRIO DO RELATÓRIO:

Prezados, (uma saudação).

Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. 
Seguem abaixo mais detalhes para validação.

📄 Caso de uso: [Descrição do caso de uso relacionado à saúde do SIEM]

🕵 Análise: [Análise técnica do problema de saúde do SIEM]

📊 Fonte de dados utilizada na análise: [Identifique a fonte do log]

🚨 Severidade: [Classifique a severidade: Baixa, Moderada, Alta, Crítica]

📋 Detalhes do Evento:

[Campos técnicos...]

Mensagem de Log: [Mensagem original do log ou resumo]

📌 Justificativa para Abertura do Caso: [Explique por que este evento indica um problema de saúde do SIEM]

🛡 Ação tomada (caso tenha sido realizado o bloqueio de IP ou URL maliciosa, descrever brevemente a ação executada): [Descreva ações tomadas, se houver]

🛠 Recomendação: [Liste recomendações específicas para corrigir o problema de saúde do SIEM]

Lembre-se: Mantenha o formato exato especificado acima e preencha apenas os campos para os quais há informações disponíveis no log.`;
```

## 🎨 Personalização

### Modificando o Formato

Para personalizar o formato do relatório:

1. **Editar prompts** em `backend/src/services/aiService.ts`
2. **Atualizar parser** em `backend/src/controllers/analyzeController.ts`
3. **Modificar interface** em `frontend/app/analise/page.tsx`

### Adicionando Novos Campos

1. Adicione o campo no prompt
2. Atualize o parser em `parseEvidenceSection()`
3. Adicione a renderização no frontend

### Exemplo de Adição de Campo

```javascript
// 1. Adicionar no prompt
"Novo Campo: [Descrição do novo campo]"

// 2. Adicionar no parser
const fieldMappings = {
  // ... campos existentes
  "Novo Campo:": "novoCampo"
}

// 3. Adicionar no frontend
{renderEvidenceField("Novo Campo", analysisResult.report.evidence?.novoCampo)}
```

## 🧪 Teste do Formato

Execute o script de teste para verificar o formato:

```bash
node test-custom-format.js
```

## 📊 Exemplo de Relatório Completo

```
Prezados, boa tarde.

Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. Seguem abaixo mais detalhes para validação.

📄 Caso de uso: Tentativa de Autenticação com Nome de Usuário Inválido

🕵 Análise: Detectada tentativa de login com credenciais inválidas, indicando possível tentativa de acesso não autorizado ao sistema.

📊 Fonte de dados utilizada na análise: Microsoft-Windows-Security-Auditing

🚨 Severidade: Moderada

📋 Detalhes do Evento:

Data do Log: 2024-01-15 14:30:22
Fonte do Log: Microsoft-Windows-Security-Auditing
Usuário de Origem: admin@company.com
Usuário Afetado: admin@company.com
IP/Host de Origem: 192.168.1.100
IP/Host Afetado: SRV-WEB-01
Localização (Origem/Impactado): Rede interna
Tipo do Evento: Falha de autenticação
Grupo: Segurança
Objeto: Sistema de autenticação
Nome do Objeto: lsass.exe
Tipo do Objeto: Processo
Assunto: Tentativa de login com credenciais inválidas
Política: Política de autenticação
Nome da Ameaça: Tentativa de acesso não autorizado
Nome do Processo: lsass.exe
Nome da Regra MPE: N/A
Mensagem do Fornecedor: Unknown user name or bad password
ID do Fornecedor: 4625
Identificador de Navegador: N/A
Ação: Detect
Status: Falha
Resultado: Login negado
IOCs (Indicadores de Comprometimento): IP 192.168.1.100, usuário admin@company.com

Mensagem de Log: User admin@company.com from 192.168.1.100 attempted login with invalid credentials

📌 Justificativa para Abertura do Caso: Este evento indica uma tentativa de acesso não autorizado, possivelmente um ataque de força bruta ou tentativa de comprometimento de credenciais. Requer investigação para determinar se é uma tentativa legítima ou maliciosa.

🛡 Ação tomada (caso tenha sido realizado o bloqueio de IP ou URL maliciosa, descrever brevemente a ação executada): Nenhuma ação foi tomada automaticamente. Recomenda-se monitoramento adicional.

🛠 Recomendação: 
• Investigar a origem do IP 192.168.1.100
• Verificar se o usuário admin@company.com é legítimo
• Implementar bloqueio temporário do IP se múltiplas tentativas forem detectadas
• Revisar políticas de autenticação
• Considerar implementação de autenticação de dois fatores
```

## 🔄 Atualizações

### Versão 3.0
- ✅ Formato customizado implementado
- ✅ IA Local exclusiva (sem APIs externas)
- ✅ Campos IOCs adicionados
- ✅ Seção de ação tomada
- ✅ Mensagem de log separada
- ✅ Máxima privacidade e segurança
- ✅ Processamento sem ofuscação

### Próximas Versões
- 🔄 Suporte a múltiplos idiomas
- 🔄 Templates customizáveis
- 🔄 Integração com sistemas de tickets
- 🔄 Exportação em PDF

---

**Sentinel-Pelanda** - Formato Customizado com IA Local Exclusiva 