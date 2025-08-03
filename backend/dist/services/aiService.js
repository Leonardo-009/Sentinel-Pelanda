"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIAnalysis = generateAIAnalysis;
exports.checkAIProviders = checkAIProviders;
const localAIService_1 = require("./localAIService");
async function generateAIAnalysis(prompt, provider) {
    if (provider === "local") {
        const securePrompt = `Você é um analista sênior de segurança cibernética. Analise o log abaixo e gere um relatório detalhado.

IMPORTANTE: Gere o relatório EXATAMENTE no formato especificado abaixo, preenchendo apenas os campos para os quais há informações disponíveis no log.

Log para análise:
${prompt}

FORMATO OBRIGATÓRIO DO RELATÓRIO:

Prezados, (uma saudação).

Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. Seguem abaixo mais detalhes para validação.

📄 Caso de uso: [Descrição do caso de uso baseado no log]

🕵 Análise: [Análise técnica do evento de segurança]

📊 Fonte de dados utilizada na análise: [Identifique a fonte do log, ex.: Windows Event Log, Syslog, Check Point SmartDefense]

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

📌 Justificativa para Abertura do Caso: [Explique por que este evento merece atenção, considerando gravidade, contexto, recorrência, possíveis riscos e relação com políticas de segurança]

🛡 Ação tomada (caso tenha sido realizado o bloqueio de IP ou URL maliciosa, descrever brevemente a ação executada): [Descreva ações tomadas, se houver]

🛠 Recomendação: [Liste recomendações específicas e acionáveis]

Lembre-se: Mantenha o formato exato especificado acima e preencha apenas os campos para os quais há informações disponíveis no log.`;
        const model = process.env.LOCAL_AI_MODEL || "llama2";
        return await localAIService_1.localAIService.generateResponse(securePrompt, model, {
            temperature: 0.3,
            top_p: 0.9
        });
    }
    else {
        throw new Error("Apenas IA local está disponível. Use 'local' como provider.");
    }
}
async function checkAIProviders() {
    const result = {
        local: false,
        availableModels: []
    };
    try {
        const isLocalHealthy = await localAIService_1.localAIService.checkHealth();
        if (isLocalHealthy) {
            result.local = true;
            result.availableModels = await localAIService_1.localAIService.listModels();
        }
    }
    catch (error) {
        console.log("IA Local não disponível:", error);
    }
    return result;
}
//# sourceMappingURL=aiService.js.map