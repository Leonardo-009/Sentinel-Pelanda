"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/utils/copyToClipboard"; // Import copyToClipboard function
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Globe,
  Hash,
  Search,
  Shield,
  Wifi,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function VerificacaoPage() {
  const [activeTab, setActiveTab] = useState("ip");
  const [inputData, setInputData] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerification = async () => {
    if (!inputData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira os dados para verificação.",
        variant: "destructive",
      });
      return;
    }

    const items = inputData.split("\n").filter((item) => item.trim());

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum item válido encontrado para verificação.",
        variant: "destructive",
      });
      return;
    }

    if (items.length > 500) {
      toast({
        title: "Limite Excedido",
        description:
          "Máximo de 500 itens por verificação. Reduza a quantidade.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/threats/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            type: activeTab,
          }),
        }
      );

      let results;
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na verificação");
      } else {
        results = await response.json();
      }
      setVerificationResults(results);

      toast({
        title: "Verificação Concluída",
        description: `${items.length} itens verificados com sucesso via VirusTotal e AbuseIPDB.`,
      });
    } catch (error: any) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro na Verificação",
        description:
          error.message || "Falha ao verificar ameaças. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const generateReportText = (results: any) => {
    const currentDate = new Date().toLocaleString("pt-BR");

    return `RELATÓRIO DE VERIFICAÇÃO DE AMEAÇAS

Data: ${currentDate}
Gerado por: Sentinel-Pelanda - Sistema de Análise de Segurança

═══════════════════════════════════════════════════════════════

📊 RESUMO EXECUTIVO

Total de itens verificados: ${results.total}
Tempo de processamento: ${results.summary.processingTime}
Fontes consultadas: ${results.summary.sources.join(", ")}

🚨 RESULTADOS POR CATEGORIA

• Maliciosos: ${results.malicious} (${(
      (results.malicious / results.total) *
      100
    ).toFixed(1)}%)
• Suspeitos: ${results.suspicious} (${(
      (results.suspicious / results.total) *
      100
    ).toFixed(1)}%)
• Limpos: ${results.clean} (${((results.clean / results.total) * 100).toFixed(
      1
    )}%)

═══════════════════════════════════════════════════════════════

🔍 ANÁLISE DETALHADA

${results.items
  .map(
    (item: any, index: number) => `
${index + 1}. ${item.value}
   Status: ${getStatusText(item.status).toUpperCase()}
   ${item.threat_type ? `Tipo de Ameaça: ${item.threat_type}` : ""}
   Confiança: ${item.confidence}%
   Fonte: ${item.source}
   ${typeof item.details?.abuseConfidence !== 'undefined' ? `Score de Abuso: ${item.details.abuseConfidence}%` : "Score de Abuso: 0%"}
   ${typeof item.details?.phishingScore !== 'undefined' ? `Score de Phishing: ${item.details.phishingScore}` : "Score de Phishing: 0"}
   ${item.detections > 0 ? `Detecções: ${item.detections}` : "Detecções: 0"}
   ${item.country ? `País: ${item.country}` : ""}
   ${item.asn ? `ASN: ${item.asn}` : ""}
   ${item.isp ? `ISP: ${item.isp}` : ""}
   ${item.reverse ? `Domínio Reverso: ${item.reverse}` : ""}
   ${item.lastSeen ? `Última Atividade: ${item.lastSeen}` : ""}
`
  )
  .join("")}

═══════════════════════════════════════════════════════════════

📌 RECOMENDAÇÕES

${
  results.malicious > 0
    ? `
🚨 AÇÃO IMEDIATA NECESSÁRIA:
• Bloquear imediatamente os ${results.malicious} itens identificados como maliciosos
• Investigar logs de acesso relacionados a esses indicadores
• Verificar se houve comprometimento nos sistemas que interagiram com esses recursos
`
    : ""
}

${
  results.suspicious > 0
    ? `
⚠️ MONITORAMENTO REFORÇADO:
• Implementar monitoramento adicional para os ${results.suspicious} itens suspeitos
• Configurar alertas para atividades relacionadas a esses indicadores
• Revisar periodicamente o status desses itens
`
    : ""
}

🛡️ MEDIDAS PREVENTIVAS:
• Manter listas de bloqueio atualizadas com os indicadores maliciosos
• Implementar verificação automática de reputação para novos indicadores
• Estabelecer processo de verificação regular de indicadores conhecidos
• Treinar equipe para reconhecer padrões de ameaças identificados

═══════════════════════════════════════════════════════════════

📋 INFORMAÇÕES TÉCNICAS

APIs Utilizadas:
• VirusTotal API v3 - Verificação de reputação e detecções
• AbuseIPDB API v2 - Análise de IPs maliciosos e relatórios de abuso

Critérios de Classificação:
• Malicioso: Múltiplas detecções em engines antivirus ou relatórios de abuso
• Suspeito: Poucas detecções ou atividade questionável reportada
• Limpo: Sem detecções ou relatórios negativos nas bases consultadas

═══════════════════════════════════════════════════════════════

Relatório gerado automaticamente pelo Sentinel-Pelanda v2.0
Para mais informações, consulte a documentação técnica.
`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "malicious":
        return "destructive";
      case "suspicious":
        return "default";
      case "clean":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "malicious":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "clean":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "malicious":
        return "Malicioso";
      case "suspicious":
        return "Suspeito";
      case "clean":
        return "Limpo";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Função para filtrar os resultados detalhados
  const getFilteredItems = () => {
    if (!verificationResults) return [];
    if (!statusFilter) return verificationResults.items;
    return verificationResults.items.filter(
      (item: any) => item.status === statusFilter
    );
  };

  // Função para gerar links externos
  const getExternalLinks = (item: any) => {
    const links: { label: string; url: string }[] = [];
    if (activeTab === "ip") {
      links.push({
        label: "VirusTotal",
        url: `https://www.virustotal.com/gui/ip-address/${item.value}`,
      });
      links.push({
        label: "AbuseIPDB",
        url: `https://www.abuseipdb.com/check/${item.value}`,
      });
    } else if (activeTab === "url") {
      links.push({
        label: "VirusTotal",
        url: `https://www.virustotal.com/gui/url/search?query=${encodeURIComponent(
          item.value
        )}`,
      });
    } else if (activeTab === "hash") {
      links.push({
        label: "VirusTotal",
        url: `https://www.virustotal.com/gui/file/${item.value}`,
      });
    }
    return links;
  };

  // Função para limpar pesquisa
  const handleClear = () => {
    setInputData("");
    setVerificationResults(null);
    setStatusFilter(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Search className="h-8 w-8 text-red-600 mr-3" />
            Verificação de Ameaças
          </h1>
          <p className="text-muted-foreground mt-1">
            Verifique IPs, URLs, Site e Hashes via VirusTotal, AbuseIPDB e  URLScan (até 500
            itens)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados para Verificação</CardTitle>
                <CardDescription>
                  Cole os dados para verificação (um item por linha)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="ip" className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      IPs
                    </TabsTrigger>
                    <TabsTrigger
                      value="url"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      URLs
                    </TabsTrigger>
                    <TabsTrigger
                      value="hash"
                      className="flex items-center gap-2"
                    >
                      <Hash className="h-4 w-4" />
                      Hashes
                    </TabsTrigger>
                    <TabsTrigger
                      value="phishing"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Phishing
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ip" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Exemplo de formato:</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        8.8.8.8
                        <br />
                        1.1.1.1
                        <br />
                        8.8.4.4
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Exemplo de formato:</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        https://example.com
                        <br />
                        http://suspicious-site.com
                        <br />
                        https://malware-domain.net
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="hash" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Exemplo de formato (MD5, SHA1, SHA256):</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        d41d8cd98f00b204e9800998ecf8427e
                        <br />
                        da39a3ee5e6b4b0d3255bfef95601890afd80709
                        <br />
                        e3b0c44298fc1c149afbf4c8996fb924
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="phishing" className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>URLs suspeitas para análise de phishing:</p>
                      <code className="bg-slate-100 p-2 rounded block mt-1">
                        https://suspicious-bank-login.com
                        <br />
                        https://paypal-verify-account.net
                        <br />
                        https://amazon-security-update.org
                      </code>
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-orange-700 text-xs">
                          <strong>⚠️ Análise de Phishing:</strong> Inclui screenshot da página, 
                          análise de conteúdo e detecção de tentativas de phishing via URLScan.io
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Textarea
                  placeholder={`Cole aqui os ${
                    activeTab === "ip"
                      ? "IPs"
                      : activeTab === "url"
                      ? "URLs"
                      : activeTab === "hash"
                      ? "Hashes"
                      : "URLs suspeitas"
                  } para verificação (um por linha)...`}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 transition-colors"
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {inputData.split("\n").filter((item) => item.trim()).length}{" "}
                    itens
                  </span>
                  <span>Máximo: 500 itens</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleVerification}
                    disabled={isVerifying || !inputData.trim()}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isVerifying ? (
                      <>
                        <Search className="h-4 w-4 mr-2 animate-spin" />
                        Verificando via APIs...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Verificar Ameaças
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="w-full"
                    disabled={isVerifying && !inputData.trim()}
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Info Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Shield className="h-5 w-5 mr-2" />
                  APIs Integradas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>• VirusTotal API v3</span>
                    <Badge className="text-xs bg-green-600 text-white border-none">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• AbuseIPDB API v2</span>
                    <Badge className="text-xs bg-green-600 text-white border-none">
                      Ativo
                    </Badge>
                  </div>
                  {activeTab === "phishing" && (
                    <div className="flex items-center justify-between">
                      <span>• URLScan.io API</span>
                      <Badge className="text-xs bg-green-600 text-white border-none">
                        Ativo
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-xs mt-3 text-blue-600">
                  {activeTab === "phishing" 
                    ? "Análise avançada de phishing com screenshots e detecção de comportamento malicioso"
                    : "Verificação em tempo real com múltiplas fontes de threat intelligence"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isVerifying && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2 animate-spin" />
                    Verificando via APIs...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Consultando VirusTotal...</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Consultando AbuseIPDB...</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Processando resultados...</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Gerando relatório...</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {verificationResults && (
              <>
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center !text-purple-600 dark:!text-purple-400">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Resumo da Verificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-blue-200 cursor-pointer ${
                          statusFilter === null ? "ring-2 ring-blue-400" : ""
                        }`}
                        onClick={() => setStatusFilter(null)}
                      >
                        <div className="text-3xl font-bold text-blue-600">
                          {verificationResults.total}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Verificado
                        </div>
                      </div>
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-red-200 cursor-pointer ${
                          statusFilter === "malicious"
                            ? "ring-2 ring-red-400"
                            : ""
                        }`}
                        onClick={() => setStatusFilter("malicious")}
                      >
                        <div className="text-3xl font-bold text-red-600">
                          {verificationResults.malicious}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Maliciosos
                        </div>
                        <div className="text-xs text-red-500 mt-1">
                          {(
                            (verificationResults.malicious /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-yellow-200 cursor-pointer ${
                          statusFilter === "suspicious"
                            ? "ring-2 ring-yellow-400"
                            : ""
                        }`}
                        onClick={() => setStatusFilter("suspicious")}
                      >
                        <div className="text-3xl font-bold text-yellow-600">
                          {verificationResults.suspicious}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Suspeitos
                        </div>
                        <div className="text-xs text-yellow-500 mt-1">
                          {(
                            (verificationResults.suspicious /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div
                        className={`text-center p-4 bg-muted rounded-lg border-2 border-green-200 cursor-pointer ${
                          statusFilter === "clean"
                            ? "ring-2 ring-green-400"
                            : ""
                        }`}
                        onClick={() => setStatusFilter("clean")}
                      >
                        <div className="text-3xl font-bold text-green-600">
                          {verificationResults.clean}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Limpos
                        </div>
                        <div className="text-xs text-green-500 mt-1">
                          {(
                            (verificationResults.clean /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                    {statusFilter !== null && (
                      <div className="mb-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStatusFilter(null)}
                        >
                          Mostrar Todos
                        </Button>
                      </div>
                    )}

                    {/* Estatísticas adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-800">
                            Tempo de Processamento
                          </span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 mt-1">
                          {verificationResults.summary.processingTime}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium text-purple-800">
                            APIs Consultadas
                          </span>
                        </div>
                        <div className="text-sm text-purple-600 mt-1">
                          {verificationResults.summary.sources.join(", ")}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Taxa de Segurança
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600 mt-1">
                          {(
                            (verificationResults.clean /
                              verificationResults.total) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>

                    {/* Alertas baseados nos resultados */}
                    {verificationResults.malicious > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h4 className="font-semibold text-red-800">
                            🚨 Alerta de Segurança
                          </h4>
                        </div>
                        <p className="text-sm text-red-700">
                          {verificationResults.malicious} indicador
                          {verificationResults.malicious > 1 ? "es" : ""}{" "}
                          malicioso
                          {verificationResults.malicious > 1 ? "s" : ""}{" "}
                          detectado
                          {verificationResults.malicious > 1 ? "s" : ""}. Ação
                          imediata recomendada.
                        </p>
                      </div>
                    )}

                    {verificationResults.suspicious > 0 &&
                      verificationResults.malicious === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800">
                              ⚠️ Monitoramento Necessário
                            </h4>
                          </div>
                          <p className="text-sm text-yellow-700">
                            {verificationResults.suspicious} indicador
                            {verificationResults.suspicious > 1 ? "es" : ""}{" "}
                            suspeito
                            {verificationResults.suspicious > 1 ? "s" : ""}{" "}
                            identificado
                            {verificationResults.suspicious > 1 ? "s" : ""}.
                            Monitoramento adicional recomendado.
                          </p>
                        </div>
                      )}

                    {verificationResults.clean ===
                      verificationResults.total && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">
                            ✅ Todos os Indicadores Seguros
                          </h4>
                        </div>
                        <p className="text-sm text-green-700">
                          Todos os {verificationResults.total} indicadores
                          verificados estão limpos. Nenhuma ameaça detectada.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() =>
                          copyToClipboard(
                            generateReportText(verificationResults)
                          )
                        }
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="!text-purple-600 dark:!text-purple-400">
                      Resultados Detalhados
                    </CardTitle>
                    <CardDescription>
                      {statusFilter === null
                        ? `Primeiros 10 resultados (total: ${verificationResults.total})`
                        : `Primeiros 10 resultados (${getStatusText(
                            statusFilter
                          )}) (total: ${getFilteredItems().length})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getFilteredItems()
                        .slice(0, 10)
                        .map((item: any, index: number) => (
            <Card
              key={index}
              className="border-l-4 bg-white dark:bg-slate-900 shadow-md"
              style={{
                borderLeftColor:
                  item.status === "malicious"
                    ? "#ef4444"
                    : item.status === "suspicious"
                    ? "#f59e0b"
                    : "#10b981",
              }}
            >
                            <CardContent className="p-4 text-slate-900 dark:text-slate-100">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(item.status)}
                                  <div>
                                    <h4 className="font-mono text-lg font-semibold">
                                      {item.value}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge
                                        variant={getStatusColor(item.status)}
                                        className="text-xs"
                                      >
                                        {getStatusText(
                                          item.status
                                        ).toUpperCase()}
                                      </Badge>
                                      {item.country && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          🌍 {item.country}
                                        </Badge>
                                      )}
                                      {/* Links externos */}
                                      {getExternalLinks(item).map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-1 text-blue-600 hover:underline flex items-center"
                                          title={`Ver no ${link.label}`}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right text-slate-900 dark:text-slate-100">
                                  <div
                                    className="text-2xl font-bold"
                                    style={{
                                      color:
                                        item.status === "malicious"
                                          ? "#ef4444"
                                          : item.status === "suspicious"
                                          ? "#f59e0b"
                                          : "#10b981",
                                    }}
                                  >
                                    {item.status === "clean"
                                      ? "✅"
                                      : item.status === "suspicious"
                                      ? "⚠️"
                                      : "🚨"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {getStatusText(item.status).toUpperCase()}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div className="space-y-2 text-slate-900 dark:text-slate-100">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Fonte:
                                    </span>
                                    <span className="font-medium">
                                      {item.source}
                                    </span>
                                  </div>
                                  {item.detections !== undefined &&
                                    item.detections > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Detecções:
                                        </span>
                                        <span className="font-medium text-red-600">
                                          {item.detections}
                                        </span>
                                      </div>
                                    )}
                                  {item.threat_type && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Tipo de Ameaça:
                                      </span>
                                      <span className="font-medium text-orange-600">
                                        {item.threat_type}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2 text-slate-900 dark:text-slate-100">
                                  {item.lastSeen && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Última Atividade:
                                      </span>
                                      <span className="font-medium">
                                        {formatDate(item.lastSeen)}
                                      </span>
                                    </div>
                                  )}
                                  {item.details &&
                                    item.details.totalReports && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Total de Relatórios:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.totalReports}
                                        </span>
                                      </div>
                                    )}
                                  {item.details &&
                                    item.details.abuseConfidence && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Score de Abuso:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseConfidence}%
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Scores das APIs - Versão Melhorada */}
                              {activeTab !== 'phishing' && (
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg mb-3 border text-slate-900 dark:text-slate-100">
                                  <h5 className="text-sm font-semibold mb-4 flex items-center">
                                    📊 Análise de Threat Intelligence
                                  </h5>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* VirusTotal Card */}
                                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500 text-slate-900 dark:text-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <Shield className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                          <div className="font-semibold text-blue-700 dark:text-blue-400">VirusTotal</div>
                                          <div className="text-xs text-muted-foreground">
                                            {activeTab === 'ip' ? 'Análise de IP' : 
                                             activeTab === 'url' ? 'Análise de URL' : 
                                             'Análise de Arquivo'}
                                          </div>
                                        </div>
                                      </div>
                                      <a
                                        href={`https://www.virustotal.com/gui/${activeTab === 'ip' ? 'ip-address' : activeTab === 'url' ? 'url' : 'file'}/${encodeURIComponent(item.value)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                    
                                    <div className="space-y-3 text-slate-900 dark:text-slate-100">
                                      {/* Scores para IPs */}
                                      {activeTab === 'ip' && (
                                        <>
                                          {item.details?.vt_malicious_score !== undefined && (
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <span className="text-sm">Maliciosos</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className="font-bold text-red-600 text-lg">
                                                  {item.details.vt_malicious_score}
                                                </span>
                                                {item.details.vt_total_engines && (
                                                  <span className="text-xs text-muted-foreground">
                                                    /{item.details.vt_total_engines}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {item.details?.vt_suspicious_score !== undefined && (
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <span className="text-sm">Suspeitos</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className="font-bold text-yellow-600 text-lg">
                                                  {item.details.vt_suspicious_score}
                                                </span>
                                                {item.details.vt_total_engines && (
                                                  <span className="text-xs text-muted-foreground">
                                                    /{item.details.vt_total_engines}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {item.details?.vt_harmless_score !== undefined && (
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-sm">Seguros</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className="font-bold text-green-600 text-lg">
                                                  {item.details.vt_harmless_score}
                                                </span>
                                                {item.details.vt_total_engines && (
                                                  <span className="text-xs text-muted-foreground">
                                                    /{item.details.vt_total_engines}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Scores para URLs */}
                                      {activeTab === 'url' && (
                                        <>
                                          {item.details?.last_analysis_stats && (
                                            <>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                  <span className="text-sm">Maliciosos</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-red-600 text-lg">
                                                    {item.details.last_analysis_stats.malicious || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                  <span className="text-sm">Suspeitos</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-yellow-600 text-lg">
                                                    {item.details.last_analysis_stats.suspicious || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                  <span className="text-sm">Seguros</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-green-600 text-lg">
                                                    {item.details.last_analysis_stats.harmless || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                  <span className="text-sm">Não Detectados</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-gray-600 text-lg">
                                                    {item.details.last_analysis_stats.undetected || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          
                                          {item.details?.reputation !== undefined && (
                                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                              <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Reputação</span>
                                                <span className={`font-medium ${
                                                  item.details.reputation > 0 ? 'text-green-600' : 
                                                  item.details.reputation < 0 ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                  {item.details.reputation}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Scores para Hashes */}
                                      {activeTab === 'hash' && (
                                        <>
                                          {item.details?.last_analysis_stats && (
                                            <>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                  <span className="text-sm">Maliciosos</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-red-600 text-lg">
                                                    {item.details.last_analysis_stats.malicious || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                  <span className="text-sm">Suspeitos</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-yellow-600 text-lg">
                                                    {item.details.last_analysis_stats.suspicious || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                  <span className="text-sm">Não Detectados</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-gray-600 text-lg">
                                                    {item.details.last_analysis_stats.undetected || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                  <span className="text-sm">Falha na Análise</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-bold text-blue-600 text-lg">
                                                    {item.details.last_analysis_stats['type-unsupported'] || 0}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    /{Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0)}
                                                  </span>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          
                                          {item.details?.reputation !== undefined && (
                                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                              <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Reputação</span>
                                                <span className={`font-medium ${
                                                  item.details.reputation > 0 ? 'text-green-600' : 
                                                  item.details.reputation < 0 ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                  {item.details.reputation}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {item.details?.meaningful_name && (
                                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                              <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Nome Principal</span>
                                                <span className="font-medium text-blue-600 truncate max-w-32" title={item.details.meaningful_name}>
                                                  {item.details.meaningful_name}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      
                                      {/* Total de Engines para todos os tipos */}
                                      {(item.details?.vt_total_engines || item.details?.last_analysis_stats) && (
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                          <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Total de Engines</span>
                                            <span className="font-medium">
                                              {item.details.vt_total_engines || 
                                               (item.details.last_analysis_stats ? 
                                                Object.values(item.details.last_analysis_stats).reduce((a: any, b: any) => a + b, 0) : 
                                                'N/A')}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* AbuseIPDB Card - Apenas para IPs */}
                                  {activeTab === 'ip' && item.details?.abuse_score !== undefined && (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border-l-4 border-purple-500 text-slate-900 dark:text-slate-100">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="h-4 w-4 text-purple-600" />
                                          </div>
                                          <div>
                                            <div className="font-semibold text-purple-700 dark:text-purple-400">AbuseIPDB</div>
                                            <div className="text-xs text-muted-foreground">Relatórios de Abuso</div>
                                          </div>
                                        </div>
                                        <a
                                          href={`https://www.abuseipdb.com/check/${item.value}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-600 hover:text-purple-800"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm">Score de Abuso</span>
                                          <div className="flex items-center space-x-2">
                                            <span
                                              className="font-bold text-2xl"
                                              style={{
                                                color: item.details.abuse_score >= 75
                                                  ? "#ef4444"
                                                  : item.details.abuse_score >= 25
                                                  ? "#f59e0b"
                                                  : "#10b981",
                                              }}
                                            >
                                              {item.details.abuse_score}%
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="h-2 rounded-full transition-all duration-300"
                                            style={{
                                              width: `${item.details.abuse_score}%`,
                                              backgroundColor: item.details.abuse_score >= 75
                                                ? "#ef4444"
                                                : item.details.abuse_score >= 25
                                                ? "#f59e0b"
                                                : "#10b981",
                                            }}
                                          ></div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-muted-foreground">Nível de Risco:</span>
                                          <span
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                              backgroundColor: item.details.abuse_score >= 75
                                                ? "#fee2e2"
                                                : item.details.abuse_score >= 25
                                                ? "#fef3c7"
                                                : "#dcfce7",
                                              color: item.details.abuse_score >= 75
                                                ? "#dc2626"
                                                : item.details.abuse_score >= 25
                                                ? "#d97706"
                                                : "#16a34a",
                                            }}
                                          >
                                            {item.details.abuse_score >= 75
                                              ? "Alto Risco"
                                              : item.details.abuse_score >= 25
                                              ? "Risco Moderado"
                                              : "Baixo Risco"}
                                          </span>
                                        </div>
                                        
                                        {item.details.abuseIPDB?.totalReports && (
                                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                              <span>Relatórios Totais</span>
                                              <span className="font-medium text-red-600">
                                                {item.details.abuseIPDB.totalReports}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Card de Status Geral para URLs e Hashes */}
                                  {(activeTab === 'url' || activeTab === 'hash') && (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500 text-slate-900 dark:text-slate-100">
                                      <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                          <div className="font-semibold text-emerald-700 dark:text-emerald-400">Status Geral</div>
                                          <div className="text-xs text-muted-foreground">Avaliação Consolidada</div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <div className="text-center">
                                          <div className="text-4xl mb-2">
                                            {item.status === 'clean' ? '✅' :
                                             item.status === 'suspicious' ? '⚠️' : '🚨'}
                                          </div>
                                          <div className={`font-bold text-lg ${
                                            item.status === 'clean' ? 'text-green-600' :
                                            item.status === 'suspicious' ? 'text-yellow-600' : 'text-red-600'
                                          }`}>
                                            {getStatusText(item.status).toUpperCase()}
                                          </div>
                                        </div>
                                        
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Confiança</span>
                                            <span className="font-medium">{item.confidence || 'N/A'}%</span>
                                          </div>
                                        </div>
                                        
                                        {item.detections !== undefined && item.detections > 0 && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Detecções</span>
                                            <span className="font-medium text-red-600">{item.detections}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  </div>
                                   </div>
                              )}

                               {/* Detalhes adicionais do VirusTotal */}
                               {activeTab !== 'phishing' && item.details &&
                                item.details.last_analysis_stats && (
                                  <div className="bg-muted p-3 rounded-lg mb-3 text-slate-900 dark:text-slate-100">
                                    <h5 className="text-sm font-semibold mb-2">
                                      📊 Análise VirusTotal:
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                      {item.details.last_analysis_stats
                                        .malicious > 0 && (
                                        <div className="text-center p-2 bg-red-100 rounded">
                                          <div className="font-bold text-red-700">
                                            {
                                              item.details.last_analysis_stats
                                                .malicious
                                            }
                                          </div>
                                          <div className="text-red-600">
                                            Maliciosos
                                          </div>
                                        </div>
                                      )}
                                      {item.details.last_analysis_stats
                                        .suspicious > 0 && (
                                        <div className="text-center p-2 bg-yellow-100 rounded">
                                          <div className="font-bold text-yellow-700">
                                            {
                                              item.details.last_analysis_stats
                                                .suspicious
                                            }
                                          </div>
                                          <div className="text-yellow-600">
                                            Suspeitos
                                          </div>
                                        </div>
                                      )}
                                      {item.details.last_analysis_stats
                                        .harmless > 0 && (
                                        <div className="text-center p-2 bg-green-100 rounded">
                                          <div className="font-bold text-green-700">
                                            {
                                              item.details.last_analysis_stats
                                                .harmless
                                            }
                                          </div>
                                          <div className="text-green-600">
                                            Seguros
                                          </div>
                                        </div>
                                      )}
                                      {item.details.last_analysis_stats
                                        .undetected > 0 && (
                                        <div className="text-center p-2 bg-gray-100 rounded">
                                          <div className="font-bold text-gray-700">
                                            {
                                              item.details.last_analysis_stats
                                                .undetected
                                            }
                                          </div>
                                          <div className="text-gray-600">
                                            Não Detectados
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Detalhes adicionais do AbuseIPDB */}
                              {activeTab !== 'phishing' && item.details && item.details.abuseIPDB && (
                                <div className="bg-muted p-3 rounded-lg mb-3 text-slate-900 dark:text-slate-100">
                                  <h5 className="text-sm font-semibold mb-2">
                                    🛡️ Análise AbuseIPDB:
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    {item.details.abuseIPDB.isp && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          ISP:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.isp}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.domain && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Domínio:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.domain}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.usageType && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Tipo de Uso:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.usageType}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.isPublic !==
                                      undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          IP Público:
                                        </span>
                                        <span className="font-medium">
                                          {item.details.abuseIPDB.isPublic
                                            ? "Sim"
                                            : "Não"}
                                        </span>
                                      </div>
                                    )}
                                    {item.details.abuseIPDB.totalReports >
                                      0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Total de Relatórios:
                                        </span>
                                        <span className="font-medium text-red-600">
                                          {item.details.abuseIPDB.totalReports}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Seção específica para Phishing */}
                              {activeTab === 'phishing' && (
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 p-4 rounded-lg mb-3 border border-red-200 text-slate-900 dark:text-slate-100">
                                  <h5 className="text-sm font-semibold mb-3 flex items-center text-red-700 dark:text-red-300">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Análise Anti-Phishing (URLScan.io)
                                  </h5>
                                  
                                  {/* Screenshot da página */}
                                  {item.details?.screenshot && (
                                    <div className="mb-4">
                                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                        <h6 className="text-xs font-semibold text-muted-foreground mb-2">SCREENSHOT DA PÁGINA</h6>
                                        <div className="border rounded overflow-hidden">
                                          <img 
                                            src={item.details.screenshot} 
                                            alt={`Screenshot de ${item.value}`}
                                            className="w-full max-h-64 object-cover"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTc5NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBOw6NvIERpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';
                                              e.currentTarget.alt = 'Screenshot não disponível';
                                            }}
                                          />
                                        </div>
                                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                          <span>Capturado via URLScan.io</span>
                                          <div className="flex gap-2">
                                            <a 
                                              href={item.details.urlscan_links?.result_url || `https://urlscan.io/result/${item.details.scan_id}/`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline flex items-center"
                                            >
                                              Análise completa <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                            {item.details.urlscan_links?.dom_url && (
                                              <a 
                                                href={item.details.urlscan_links.dom_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:underline flex items-center"
                                              >
                                                Ver DOM <ExternalLink className="h-3 w-3 ml-1" />
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Análise de Phishing */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded border text-slate-900 dark:text-slate-100">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">INDICADORES DE PHISHING</h6>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Score de Phishing:</span>
                                          <span className={`font-medium ${
                                            item.details?.phishing_score >= 75 ? 'text-red-600' :
                                            item.details?.phishing_score >= 50 ? 'text-yellow-600' : 'text-green-600'
                                          }`}>
                                            {typeof item.details?.phishing_score === 'number' ? item.details.phishing_score : 0}%
                                          </span>
                                        </div>
                                        
                                        {item.details?.brand_detected && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Marca Detectada:</span>
                                            <span className="font-medium text-orange-600">{item.details.brand_detected}</span>
                                          </div>
                                        )}
                                        
                                        {item.details?.certificate_info && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Certificado SSL:</span>
                                            <span className={`font-medium ${
                                              item.details.certificate_info.valid ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                              {item.details.certificate_info.valid ? 'Válido' : 'Inválido'}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {item.details?.domain_age && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Idade do Domínio:</span>
                                            <span className="font-medium">{item.details.domain_age} dias</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded border text-slate-900 dark:text-slate-100">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">ANÁLISE TÉCNICA</h6>
                                      <div className="space-y-2 text-sm">
                                        {item.details?.technologies && (
                                          <div>
                                            <span className="text-muted-foreground text-xs">Tecnologias:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {item.details.technologies.slice(0, 3).map((tech: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {tech}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {item.details?.redirects && item.details.redirects.length > 0 && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Redirecionamentos:</span>
                                            <span className={`font-medium ${
                                              item.details.redirects.length > 3 ? 'text-red-600' : 'text-yellow-600'
                                            }`}>
                                              {item.details.redirects.length}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {item.details?.suspicious_forms && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Formulários Suspeitos:</span>
                                            <span className={`font-medium ${
                                              item.details.suspicious_forms > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                              {item.details.suspicious_forms}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {item.details?.external_links && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Links Externos:</span>
                                            <span className="font-medium">{item.details.external_links}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Informações da Página */}
                                  {item.details?.page_info && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border text-slate-900 dark:text-slate-100">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">🌐 INFORMAÇÕES DA PÁGINA</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="space-y-2">
                                          {item.details.page_info.domain && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Domínio:</span>
                                              <span className="font-medium break-all">{item.details.page_info.domain}</span>
                                            </div>
                                          )}
                                          {item.details.page_info.ip && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">IP:</span>
                                              <span className="font-medium">{item.details.page_info.ip}</span>
                                            </div>
                                          )}
                                          {item.details.page_info.server && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Servidor:</span>
                                              <span className="font-medium">{item.details.page_info.server}</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          {item.details.page_info.country && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">País:</span>
                                              <span className="font-medium">{item.details.page_info.country}</span>
                                            </div>
                                          )}
                                          {item.details.page_info.city && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Cidade:</span>
                                              <span className="font-medium">{item.details.page_info.city}</span>
                                            </div>
                                          )}
                                          {item.details.page_info.asnname && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">ASN:</span>
                                              <span className="font-medium text-xs">{item.details.page_info.asnname}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Análise de Rede */}
                                  {item.details?.network_info && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border text-slate-900 dark:text-slate-100">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">🔗 ANÁLISE DE REDE</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">IPs Únicos:</span>
                                            <span className="font-medium">{item.details.network_info.ips.length}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Domínios:</span>
                                            <span className="font-medium">{item.details.network_info.domains.length}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Países:</span>
                                            <span className="font-medium">{item.details.network_info.countries.length}</span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          {item.details.network_info.countries.length > 0 && (
                                            <div>
                                              <span className="text-muted-foreground text-xs">Países detectados:</span>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {item.details.network_info.countries.slice(0, 3).map((country: string, idx: number) => (
                                                  <Badge key={idx} variant="outline" className="text-xs">
                                                    {country}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Estatísticas */}
                                  {item.details?.statistics && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border text-slate-900 dark:text-slate-100">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">📊 ESTATÍSTICAS</h6>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded">
                                          <div className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                                            {item.details.statistics.requests}
                                          </div>
                                          <div className="text-xs text-blue-600 dark:text-blue-400">Requisições</div>
                                        </div>
                                        <div className="p-2 bg-green-50 dark:bg-green-900 rounded">
                                          <div className="font-bold text-green-700 dark:text-green-300 text-lg">
                                            {item.details.statistics.unique_ips}
                                          </div>
                                          <div className="text-xs text-green-600 dark:text-green-400">IPs Únicos</div>
                                        </div>
                                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
                                          <div className="font-bold text-yellow-700 dark:text-yellow-300 text-lg">
                                            {item.details.statistics.unique_countries}
                                          </div>
                                          <div className="text-xs text-yellow-600 dark:text-yellow-400">Países</div>
                                        </div>
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900 rounded">
                                          <div className="font-bold text-purple-700 dark:text-purple-300 text-lg">
                                            {(item.details.statistics.data_length / 1024).toFixed(1)}KB
                                          </div>
                                          <div className="text-xs text-purple-600 dark:text-purple-400">Dados</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Vereditos Detalhados */}
                                  {item.details?.verdicts_detail && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">⚖️ VEREDITOS DETALHADOS</h6>
                                      <div className="space-y-3">
                                        {/* URLScan Verdict */}
                                        <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
                                          <div>
                                            <div className="font-medium text-blue-700 dark:text-blue-300">URLScan.io</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                              {item.details.verdicts_detail.urlscan.categories.join(', ') || 'Sem categorias'}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className={`font-bold text-lg ${
                                              item.details.verdicts_detail.urlscan.malicious ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                              {item.details.verdicts_detail.urlscan.score}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {item.details.verdicts_detail.urlscan.malicious ? 'Malicioso' : 'Limpo'}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Community Verdict */}
                                        {item.details.verdicts_detail.community.votes_total > 0 && (
                                          <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900 rounded">
                                            <div>
                                              <div className="font-medium text-orange-700 dark:text-orange-300">Comunidade</div>
                                              <div className="text-xs text-orange-600 dark:text-orange-400">
                                                {item.details.verdicts_detail.community.votes_total} votos totais
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-sm">
                                                <span className="text-red-600">🔻 {item.details.verdicts_detail.community.votes_malicious}</span>
                                                <span className="mx-1">|</span>
                                                <span className="text-green-600">🔺 {item.details.verdicts_detail.community.votes_harmless}</span>
                                              </div>
                                              <div className="text-xs text-muted-foreground">Mal. | Seguro</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Links Úteis */}
                                  <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-3 rounded border border-blue-200">
                                    <h6 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">🔗 LINKS ÚTEIS</h6>
                                    <div className="flex flex-wrap gap-2">
                                      <a
                                        href={item.details.urlscan_links?.result_url || `https://urlscan.io/result/${item.details.scan_id}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                      >
                                        📊 Relatório Completo <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                      
                                      {item.details.urlscan_links?.screenshot_url && (
                                        <a
                                          href={item.details.urlscan_links.screenshot_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                        >
                                          📸 Screenshot <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      )}
                                      
                                      {item.details.urlscan_links?.dom_url && (
                                        <a
                                          href={item.details.urlscan_links.dom_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                                        >
                                          🌐 Ver DOM <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      )}
                                      
                                      <a
                                        href={`https://urlscan.io/search/#${encodeURIComponent(item.value)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                      >
                                        🔍 Buscar Similar <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </div>
                                  </div>

                                  {/* Recomendações específicas para phishing */}
                                  <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border">
                                    <h6 className="text-xs font-semibold text-muted-foreground mb-2">💡 RECOMENDAÇÕES ANTI-PHISHING</h6>
                                    <div className="text-xs space-y-1">
                                      {item.status === "malicious" && (
                                        <div className="text-red-700">
                                          🚨 <strong>PHISHING CONFIRMADO:</strong> Bloquear URL imediatamente. 
                                          Alertar usuários sobre esta tentativa de phishing.
                                        </div>
                                      )}
                                      {item.status === "suspicious" && (
                                        <div className="text-yellow-700">
                                          ⚠️ <strong>SUSPEITA DE PHISHING:</strong> Monitorar URL e implementar 
                                          controles adicionais. Educar usuários sobre os riscos.
                                        </div>
                                      )}
                                      {item.status === "clean" && (
                                        <div className="text-green-700">
                                          ✅ <strong>SEM INDICADORES:</strong> URL não apresenta sinais de phishing, 
                                          mas manter vigilância contínua.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Informações específicas por tipo */}
                              {activeTab === 'url' && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-lg mb-3 border border-blue-200">
                                  <h5 className="text-sm font-semibold mb-3 flex items-center text-blue-700 dark:text-blue-300">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Análise Detalhada de URL
                                  </h5>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Informações da URL */}
                                    <div className="space-y-3">
                                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                        <h6 className="text-xs font-semibold text-muted-foreground mb-2">CARACTERÍSTICAS DA URL</h6>
                                        <div className="space-y-2 text-sm">
                                          {(() => {
                                            try {
                                              const url = new URL(item.value);
                                              return (
                                                <>
                                                  <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Protocolo:</span>
                                                    <span className="font-medium">{url.protocol}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Domínio:</span>
                                                    <span className="font-medium break-all">{url.hostname}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Caminho:</span>
                                                    <span className="font-medium break-all text-xs">{url.pathname || '/'}</span>
                                                  </div>
                                                  {url.search && (
                                                    <div className="flex justify-between">
                                                      <span className="text-muted-foreground">Parâmetros:</span>
                                                      <span className="font-medium text-xs">Presente</span>
                                                    </div>
                                                  )}
                                                </>
                                              );
                                            } catch (error) {
                                              return (
                                                <div className="text-red-500 text-xs">
                                                  URL inválida ou malformada
                                                </div>
                                              );
                                            }
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Categorias e Tags */}
                                    {item.details?.categories && (
                                      <div className="space-y-3">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                          <h6 className="text-xs font-semibold text-muted-foreground mb-2">CATEGORIAS IDENTIFICADAS</h6>
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(item.details.categories).map(([category, engines]) => (
                                              <Badge key={category} variant="outline" className="text-xs">
                                                {category} ({String(engines)})
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Histórico de Submissões */}
                                  {item.details?.submission_history && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">HISTÓRICO DE ANÁLISES</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="text-center">
                                          <div className="font-bold text-lg text-blue-600">
                                            {item.details.submission_history.total || 'N/A'}
                                          </div>
                                          <div className="text-xs text-muted-foreground">Total de Análises</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-bold text-lg text-green-600">
                                            {item.details.submission_history.clean || 'N/A'}
                                          </div>
                                          <div className="text-xs text-muted-foreground">Resultados Limpos</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-bold text-lg text-red-600">
                                            {item.details.submission_history.malicious || 'N/A'}
                                          </div>
                                          <div className="text-xs text-muted-foreground">Resultados Maliciosos</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {activeTab === 'hash' && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 p-4 rounded-lg mb-3 border border-amber-200">
                                  <h5 className="text-sm font-semibold mb-3 flex items-center text-amber-700 dark:text-amber-300">
                                    <Hash className="h-4 w-4 mr-2" />
                                    Análise Detalhada de Hash
                                  </h5>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Informações do Hash */}
                                    <div className="space-y-3">
                                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                        <h6 className="text-xs font-semibold text-muted-foreground mb-2">CARACTERÍSTICAS DO ARQUIVO</h6>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tipo de Hash:</span>
                                            <span className="font-medium">
                                              {item.value.length === 32 ? 'MD5' : 
                                               item.value.length === 40 ? 'SHA1' : 
                                               item.value.length === 64 ? 'SHA256' : 'Desconhecido'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tamanho:</span>
                                            <span className="font-medium">{item.value.length} caracteres</span>
                                          </div>
                                          {item.details?.file_size && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tamanho do Arquivo:</span>
                                              <span className="font-medium">{(item.details.file_size / 1024).toFixed(2)} KB</span>
                                            </div>
                                          )}
                                          {item.details?.file_type && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tipo de Arquivo:</span>
                                              <span className="font-medium">{item.details.file_type}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Nomes de Arquivo */}
                                    {item.details?.names && (
                                      <div className="space-y-3">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                          <h6 className="text-xs font-semibold text-muted-foreground mb-2">NOMES CONHECIDOS</h6>
                                          <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {item.details.names.slice(0, 5).map((name: string, idx: number) => (
                                              <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">
                                                {name}
                                              </div>
                                            ))}
                                            {item.details.names.length > 5 && (
                                              <div className="text-xs text-muted-foreground">
                                                +{item.details.names.length - 5} outros nomes
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Primeira e Última Submissão */}
                                  {(item.details?.first_submission_date || item.details?.last_submission_date) && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">HISTÓRICO DE SUBMISSÕES</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {item.details.first_submission_date && (
                                          <div>
                                            <div className="text-muted-foreground text-xs">Primeira Submissão</div>
                                            <div className="font-medium">
                                              {new Date(item.details.first_submission_date * 1000).toLocaleDateString('pt-BR')}
                                            </div>
                                          </div>
                                        )}
                                        {item.details.last_submission_date && (
                                          <div>
                                            <div className="text-muted-foreground text-xs">Última Submissão</div>
                                            <div className="font-medium">
                                              {new Date(item.details.last_submission_date * 1000).toLocaleDateString('pt-BR')}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Tags de Comportamento */}
                                  {item.details?.tags && item.details.tags.length > 0 && (
                                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">TAGS DE COMPORTAMENTO</h6>
                                      <div className="flex flex-wrap gap-1">
                                        {item.details.tags.map((tag: string, idx: number) => (
                                          <Badge 
                                            key={idx} 
                                            variant={tag.includes('malicious') || tag.includes('trojan') ? 'destructive' : 'secondary'}
                                            className="text-xs"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Informações geográficas (apenas para IPs) */}
                              {activeTab === 'ip' && (item.details?.virusTotal?.city ||
                                item.details?.virusTotal?.continent ||
                                item.details?.virusTotal?.as_owner) && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 p-4 rounded-lg mb-3 border border-green-200">
                                  <h5 className="text-sm font-semibold mb-3 flex items-center text-green-700 dark:text-green-300">
                                    🌍 Informações Geográficas
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">LOCALIZAÇÃO</h6>
                                      <div className="space-y-2 text-sm">
                                        {item.details.virusTotal.city && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Cidade:</span>
                                            <span className="font-medium">{item.details.virusTotal.city}</span>
                                          </div>
                                        )}
                                        {item.details.virusTotal.continent && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Continente:</span>
                                            <span className="font-medium">{item.details.virusTotal.continent}</span>
                                          </div>
                                        )}
                                        {item.country && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">País:</span>
                                            <span className="font-medium">{item.country}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                      <h6 className="text-xs font-semibold text-muted-foreground mb-2">INFRAESTRUTURA</h6>
                                      <div className="space-y-2 text-sm">
                                        {item.details.virusTotal.as_owner && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Proprietário AS:</span>
                                            <span className="font-medium break-all">{item.details.virusTotal.as_owner}</span>
                                          </div>
                                        )}
                                        {item.details.virusTotal.reputation !== undefined && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Reputação:</span>
                                            <span className="font-medium">{item.details.virusTotal.reputation}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Recomendações baseadas no status */}
                              <div className="bg-muted p-3 rounded-lg">
                                <h5 className="text-sm font-semibold mb-2">
                                  💡 Recomendações:
                                </h5>
                                <div className="text-xs space-y-1">
                                  {item.status === "malicious" && (
                                    <div className="text-red-700">
                                      🚨 <strong>Ação Imediata:</strong>{" "}
                                      Bloquear este indicador imediatamente.
                                      Investigar logs de acesso e verificar
                                      comprometimento.
                                    </div>
                                  )}
                                  {item.status === "suspicious" && (
                                    <div className="text-yellow-700">
                                      ⚠️ <strong>Monitoramento:</strong>{" "}
                                      Implementar monitoramento adicional e
                                      configurar alertas para atividades
                                      relacionadas.
                                    </div>
                                  )}
                                  {item.status === "clean" && (
                                    <div className="text-green-700">
                                      ✅ <strong>Seguro:</strong> Este indicador
                                      não apresenta ameaças conhecidas. Manter
                                      monitoramento padrão.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                    {getFilteredItems().length > 10 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" className="w-full">
                          Ver Todos os {getFilteredItems().length} Resultados
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
