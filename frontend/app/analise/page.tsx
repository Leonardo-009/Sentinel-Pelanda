"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Brain, CheckCircle, Copy, FileText } from "lucide-react"
import React, { useState } from "react"

export default function AnalysePage() {
  const [logText, setLogText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const { toast } = useToast()
  const [reportType, setReportType] = useState("completo")

  // Verificar se a IA local está disponível
  const checkLocalAI = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/health`)
      const healthData = await response.json()
      console.log("Backend health:", healthData)
    } catch (error) {
      console.error("Erro ao verificar IA local:", error)
    }
  }

  // Verificar IA local ao montar o componente
  React.useEffect(() => {
    checkLocalAI()
  }, [])

  const SAUDE_SIEM_PROMPT = `Você é um analista de segurança cibernética especializado em monitoramento e manutenção da saúde de sistemas SIEM. Sua tarefa é analisar o log fornecido, identificar possíveis problemas relacionados à saúde do SIEM (ex.: falhas na coleta de logs, atrasos, falsos positivos, regras mal configuradas, integrações inativas) e redigir um relatório claro, conciso e profissional para a equipe de manutenção do SIEM.

IMPORTANTE: Gere o relatório EXATAMENTE no formato especificado abaixo, preenchendo apenas os campos para os quais há informações disponíveis no log.

Log para análise: {log}

FORMATO OBRIGATÓRIO DO RELATÓRIO:

Prezados, (uma saudação).

Nossa equipe de monitoramento, identificou um evento relevante em seu ambiente. 
Seguem abaixo mais detalhes para validação.

📄 Caso de uso: [Descrição do caso de uso relacionado à saúde do SIEM]

🕵 Análise: [Análise técnica do problema de saúde do SIEM]

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
Tipo do Evento: [Tipo de evento, ex.: falha de integração, atraso na coleta]
Grupo: [Categoria do evento, ex.: saúde do SIEM]
Objeto: [Recurso alvo, ex.: conector, integração]
Nome do Objeto: [Nome específico do recurso, ex.: Conector_Firewall_X]
Tipo do Objeto: [Tipo de recurso, ex.: conector, serviço]
Assunto: [Resumo do evento, ex.: falha na coleta de logs]
Política: [Política ou configuração relevante, se aplicável]
Nome da Ameaça: [Nome do problema, ex.: atraso na ingestão]
Nome do Processo: [Processo envolvido, ex.: ingestão de logs]
Nome da Regra MPE: [Regra que disparou o alerta, se aplicável]
Mensagem do Fornecedor: [Mensagem ou código de erro do sistema]
ID do Fornecedor: [Identificador único do evento, se disponível]
Identificador de Navegador: [User-agent, se aplicável]
Ação: [Ação relacionada, ex.: tentativa de coleta]
Status: [Status da ação, ex.: falha]
Resultado: [Resultado final, ex.: log não coletado]
IOCs (Indicadores de Comprometimento): [Liste os IOCs identificados, se houver]

Mensagem de Log: [Mensagem original do log ou resumo]

📌 Justificativa para Abertura do Caso: [Explique por que este evento indica um problema de saúde do SIEM, considerando impacto na operação, possíveis lacunas no monitoramento e necessidade de correção]

🛡 Ação tomada (caso tenha sido realizado o bloqueio de IP ou URL maliciosa, descrever brevemente a ação executada): [Descreva ações tomadas, se houver]

🛠 Recomendação: [Liste recomendações específicas para corrigir o problema de saúde do SIEM]

Lembre-se: Mantenha o formato exato especificado acima e preencha apenas os campos para os quais há informações disponíveis no log.`;

  const handleAnalyze = async () => {
    if (!logText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o log para análise.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      let promptToSend = undefined
      if (reportType === "saude-siem") {
        promptToSend = SAUDE_SIEM_PROMPT.replace("{log}", logText)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logText,
          provider: "local",
          reportType,
          prompt: promptToSend,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error("Erro na análise:", error)
      toast({
        title: "Erro",
        description: "Erro ao analisar o log. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Relatório copiado para a área de transferência.",
    })
  }

  const renderEvidenceField = (label: string, value: string | undefined) => {
    if (!value || value === "N/A" || value === "n/a") return null

    return (
      <div>
        <strong className="text-sm">{label}:</strong>
        <div className="text-sm text-muted-foreground break-words">{value}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Análise de Logs</h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-gray-300">
            Analise logs de segurança com IA Local para máxima privacidade
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section - Coluna Esquerda */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-slate-100">
                  <Brain className="h-5 w-5 mr-2" />
                  Análise de Log
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Cole o log de segurança para análise com IA Local
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-900 dark:text-slate-100">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Log de Segurança</label>
                  <Textarea
                    placeholder="Cole aqui o log de segurança para análise..."
                    value={logText}
                    onChange={(e) => setLogText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Provedor de IA</label>
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">IA Local (Ollama)</span>
                    <Badge variant="secondary" className="text-xs">Processamento Offline</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Análise realizada localmente com máxima privacidade
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Relatório</label>
                  <RadioGroup value={reportType} onValueChange={setReportType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completo" id="completo" />
                      <label htmlFor="completo" className="text-sm">
                        Relatório Completo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <RadioGroupItem value="saude-siem" id="saude-siem" />
                      <label htmlFor="saude-siem" className="text-sm">
                        Saúde de SIEM
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !logText.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Log
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Results Section - Coluna Direita */}
          <div className="space-y-6">
            {/* Processing Status */}
            {isAnalyzing && (
              <Card className="bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900 dark:text-slate-100">
                    <Brain className="h-5 w-5 mr-2 animate-spin" />
                    Processando...
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-900 dark:text-slate-100">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Analisando log...</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Enviando para IA Local...</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Gerando relatório...</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisResult && analysisResult.type === "completo" && (
              <>
                {/* Relatório Completo */}
                <Card className="bg-white dark:bg-slate-900 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center !text-purple-600 dark:!text-purple-400">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Relatório de Análise de Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-slate-900 dark:text-slate-100">
                    {/* Cabeçalho do Relatório */}
                    <div className="bg-muted p-4 rounded-lg text-slate-900 dark:text-slate-100">
                      <p className="text-sm">
                        <strong>{analysisResult.report.greeting}</strong>
                      </p>
                      <p className="text-sm mt-2">{analysisResult.report.introduction}</p>
                    </div>

                    {/* Caso de Uso */}
                    {analysisResult.report.caseUse && (
                      <div>
                        <h4 className="font-semibold mb-2 !text-purple-600 dark:!text-purple-400">Caso de uso:</h4>
                        <p className="text-sm bg-muted p-3 rounded text-slate-900 dark:text-slate-100">{analysisResult.report.caseUse}</p>
                      </div>
                    )}

                    {/* Análise */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">🕵 Análise:</h4>
                      <p className="text-sm bg-muted p-3 rounded text-slate-900 dark:text-slate-100">{analysisResult.report.analysis}</p>
                    </div>

                    {/* Fonte */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">📊 Fonte:</h4>
                      <p className="text-sm">{analysisResult.report.source}</p>
                    </div>

                    {/* Severidade */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">🚨 Severidade:</h4>
                      <Badge variant="destructive" className="text-sm">
                        {analysisResult.report.severity}
                      </Badge>
                    </div>

                    {/* Evidências */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center !text-purple-600 dark:!text-purple-400">📋 Detalhes do Evento:</h4>
                      <div className="bg-muted p-4 rounded-lg space-y-3 text-sm text-slate-900 dark:text-slate-100">
                        <div className="grid grid-cols-1 gap-4">
                          {renderEvidenceField("Data do Log", analysisResult.report.evidence?.logDate)}
                          {renderEvidenceField("Fonte do Log", analysisResult.report.evidence?.logSource)}
                          {renderEvidenceField("Usuário de Origem", analysisResult.report.evidence?.originUser)}
                          {renderEvidenceField("Usuário Afetado", analysisResult.report.evidence?.affectedUser)}
                          {renderEvidenceField("IP/Host de Origem", analysisResult.report.evidence?.originIP)}
                          {renderEvidenceField("IP/Host Afetado", analysisResult.report.evidence?.affectedIP)}
                          {renderEvidenceField("Localização", analysisResult.report.evidence?.location)}
                          {renderEvidenceField("Tipo do Evento", analysisResult.report.evidence?.eventType)}
                          {renderEvidenceField("Grupo", analysisResult.report.evidence?.group)}
                          {renderEvidenceField("Objeto", analysisResult.report.evidence?.object)}
                          {renderEvidenceField("Nome do Objeto", analysisResult.report.evidence?.objectName)}
                          {renderEvidenceField("Tipo do Objeto", analysisResult.report.evidence?.objectType)}
                          {renderEvidenceField("Assunto", analysisResult.report.evidence?.subject)}
                          {renderEvidenceField("Política", analysisResult.report.evidence?.policy)}
                          {renderEvidenceField("Nome da Ameaça", analysisResult.report.evidence?.threatName)}
                          {renderEvidenceField("Nome do Processo", analysisResult.report.evidence?.processName)}
                          {renderEvidenceField("Nome da Regra MPE", analysisResult.report.evidence?.ruleName)}
                          {renderEvidenceField("Ação", analysisResult.report.evidence?.action)}
                          {renderEvidenceField("Status", analysisResult.report.evidence?.status)}
                          {renderEvidenceField("Resultado", analysisResult.report.evidence?.result)}
                          {renderEvidenceField("IOCs", analysisResult.report.evidence?.iocs)}
                        </div>

                        {analysisResult.report.evidence?.vendorMessage && (
                          <div className="mt-4">
                            <strong>Mensagem do Fornecedor:</strong>
                            <div className="bg-background p-3 rounded border mt-2 font-mono text-xs text-slate-900 dark:text-slate-100">
                              {analysisResult.report.evidence.vendorMessage}
                            </div>
                          </div>
                        )}

                        {analysisResult.report.evidence?.vendorId && (
                          <div>
                            <strong>ID do Fornecedor:</strong> {analysisResult.report.evidence.vendorId}
                          </div>
                        )}

                        {analysisResult.report.evidence?.browserId && (
                          <div>
                            <strong>Identificador de Navegador:</strong> {analysisResult.report.evidence.browserId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mensagem de Log */}
                    {analysisResult.report.logMessage && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">📋 Mensagem de Log:</h4>
                        <div className="bg-muted p-3 rounded font-mono text-sm text-slate-900 dark:text-slate-100">
                          {analysisResult.report.logMessage}
                        </div>
                      </div>
                    )}

                    {/* Justificativa */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">📌 Justificativa para Abertura do Caso:</h4>
                      <p className="text-sm bg-muted p-3 rounded text-slate-900 dark:text-slate-100">
                        {analysisResult.report.justification}
                      </p>
                    </div>

                    {/* Ação Tomada */}
                    {analysisResult.report.actionTaken && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center !text-purple-600 dark:!text-purple-400">🛡 Ação Tomada:</h4>
                        <p className="text-sm bg-muted p-3 rounded text-slate-900 dark:text-slate-100">
                          {analysisResult.report.actionTaken}
                        </p>
                      </div>
                    )}

                    {/* Recomendações */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center !text-purple-600 dark:!text-purple-400">🛠 Recomendação:</h4>
                      <div className="bg-muted p-4 rounded-lg text-slate-900 dark:text-slate-100">
                        <ul className="text-sm space-y-2">
                          {analysisResult.report.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => copyToClipboard(analysisResult.reportText)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Placeholder quando não há resultado */}
            {!isAnalyzing && !analysisResult && (
              <Card className="bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-muted-foreground">
                    <FileText className="h-5 w-5 mr-2" />
                    Resultado da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-900 dark:text-slate-100">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>O resultado da análise aparecerá aqui</p>
                    <p className="text-sm mt-2">Cole um log e clique em "Analisar Log" para começar</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
