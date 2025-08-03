import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Brain, FileText, Search, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Sentinel-Pelanda</h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Plataforma inteligente para análise de logs de segurança e verificação de ameaças com IA
          </p>
        </header>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Análise de Logs */}
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white/90 dark:hover:bg-slate-800/70 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-fit">
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-slate-900 dark:text-white text-2xl">Análise de Logs</CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">
                Analise logs de segurança e gere relatórios inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-600 dark:text-gray-400 space-y-2">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span>Relatório Completo</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                  <span>Saúde do SIEM</span>
                </div>
              </div>
              <Link href="/analise" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">Iniciar Análise</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Verificação de Ameaças */}
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white/90 dark:hover:bg-slate-800/70 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-600/20 rounded-full w-fit">
                <Search className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-slate-900 dark:text-white text-2xl">Verificação de Ameaças</CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">Verifique IPs, URLs e Hashes em lote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-600 dark:text-gray-400 space-y-2">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                  <span>Verificação de IPs</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                  <span>Análise de URLs</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span>Validação de Hashes</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span>Verificação de Phishing</span>
                </div>
              </div>
              <Link href="/verificacao" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700 mt-4">Verificar Ameaças</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
            <div className="text-slate-600 dark:text-gray-400">Precisão</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
            <div className="text-slate-600 dark:text-gray-400">Verificações/Lote</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">100%</div>
            <div className="text-slate-600 dark:text-gray-400">Dados Protegidos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">24/7</div>
            <div className="text-slate-600 dark:text-gray-400">Disponibilidade</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-600 dark:text-gray-400">
          <p>© 2025 Sentinel-Pelanda - Plataforma de Análise de Segurança com IA</p>
        </footer>
      </div>
    </div>
  )
}
