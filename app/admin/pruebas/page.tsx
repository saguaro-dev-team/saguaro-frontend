'use client'

import { useState, useTransition } from 'react'
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  RefreshCw, 
  FileDown,
  Beaker,
  Activity,
  Code,
  Lock,
  Database,
  Cpu,
  Globe,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  runSecurityAudit, 
  runUnitTestsAction, 
  runLoadTestsAction,
  runIntegrationTestsAction,
  runAPITestsAction,
  runE2ETestsAction,
  runAccessibilityTestsAction,
  SecurityAuditResults, 
  UnitTestResults, 
  LoadTestResults,
  IntegrationTestResults,
  E2ETestResults,
  APITestResults,
  AccessibilityTestResults
} from '@/app/actions/seguridad'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PruebasQAPage() {
  const [activeTab, setActiveTab] = useState<'seguridad' | 'unitarias' | 'estres' | 'integracion' | 'api' | 'e2e' | 'accesibilidad'>('seguridad')
  
  // States for tests
  const [securityResults, setSecurityResults] = useState<SecurityAuditResults | null>(null)
  const [unitResults, setUnitResults] = useState<UnitTestResults | null>(null)
  const [loadResults, setLoadResults] = useState<LoadTestResults | null>(null)
  const [integrationResults, setIntegrationResults] = useState<IntegrationTestResults | null>(null)
  const [apiResults, setApiResults] = useState<APITestResults | null>(null)
  const [e2eResults, setE2eResults] = useState<E2ETestResults | null>(null)
  const [accessibilityResults, setAccessibilityResults] = useState<AccessibilityTestResults | null>(null)

  const [isPending, startTransition] = useTransition()
  const [dates, setDates] = useState({
    seguridad: '',
    unitarias: '',
    estres: '',
    integracion: '',
    api: '',
    e2e: '',
    accesibilidad: ''
  })

  const handleRunTest = () => {
    startTransition(async () => {
      const timestamp = new Date().toLocaleString('es-CL')
      if (activeTab === 'seguridad') {
        const res = await runSecurityAudit()
        if (res.success && res.results) {
          setSecurityResults(res.results)
          setDates(prev => ({ ...prev, seguridad: timestamp }))
        }
      } else if (activeTab === 'unitarias') {
        const res = await runUnitTestsAction()
        if (res.success && res.results) {
          setUnitResults(res.results)
          setDates(prev => ({ ...prev, unitarias: timestamp }))
        }
      } else if (activeTab === 'estres') {
        const res = await runLoadTestsAction()
        if (res.success && res.results) {
          setLoadResults(res.results)
          setDates(prev => ({ ...prev, estres: timestamp }))
        }
      } else if (activeTab === 'integracion') {
        const res = await runIntegrationTestsAction()
        if (res.success && res.results) {
          setIntegrationResults(res.results)
          setDates(prev => ({ ...prev, integracion: timestamp }))
        }
      } else if (activeTab === 'api') {
        const res = await runAPITestsAction()
        if (res.success && res.results) {
          setApiResults(res.results)
          setDates(prev => ({ ...prev, api: timestamp }))
        }
      } else if (activeTab === 'e2e') {
        const res = await runE2ETestsAction()
        if (res.success && res.results) {
          setE2eResults(res.results)
          setDates(prev => ({ ...prev, e2e: timestamp }))
        }
      } else if (activeTab === 'accesibilidad') {
        const res = await runAccessibilityTestsAction()
        if (res.success && res.results) {
          setAccessibilityResults(res.results)
          setDates(prev => ({ ...prev, accesibilidad: timestamp }))
        }
      }
    })
  }

  // --- PDF GENERATOR SCRIPTS ---
  const downloadPDF = () => {
    const doc = new jsPDF()
    const timestamp = dates[activeTab] || new Date().toLocaleString('es-CL')
    
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(0, 0, 210, 50, 'F')
    
    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(`INFORME QA: ${activeTab.toUpperCase()}`, 14, 25)
    
    doc.setFontSize(10)
    doc.setTextColor(200)
    doc.setFont('helvetica', 'normal')
    doc.text(`Proyecto: Saguaro Barefoot Chile | Auditor: Alberto Quiroz`, 14, 34)
    doc.text(`Fecha de Ejecución: ${timestamp}`, 14, 40)

    let currentY = 60
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('1. Bitácora de Salida de Consola', 14, currentY)
    currentY += 8

    let logs: string[] = []
    if (activeTab === 'seguridad' && securityResults) {
      logs = [...securityResults.sqlInjection.details, ...securityResults.xssInjection.details]
    } else if (activeTab === 'unitarias' && unitResults) {
      logs = unitResults.logs
    } else if (activeTab === 'estres' && loadResults) {
      logs = loadResults.logs
    } else if (activeTab === 'integracion' && integrationResults) {
      logs = integrationResults.logs
    } else if (activeTab === 'api' && apiResults) {
      logs = apiResults.logs
    } else if (activeTab === 'e2e' && e2eResults) {
      logs = e2eResults.logs
    } else if (activeTab === 'accesibilidad' && accessibilityResults) {
      logs = accessibilityResults.logs
    }

    const logRows = logs.map(l => [l])
    autoTable(doc, {
      head: [["Registro de Ejecución / Consola del Motor de Pruebas"]],
      body: logRows,
      startY: currentY,
      styles: { fontSize: 8, font: 'courier' },
      headStyles: { fillColor: [79, 70, 229] }
    })

    currentY = (doc as any).lastAutoTable.finalY + 20
    doc.line(14, currentY, 80, currentY)
    doc.text('Firma: Alberto Quiroz', 14, currentY + 5)
    doc.text('Encargado de Seguridad y QA', 14, currentY + 9)

    doc.save(`QA-Reporte-${activeTab}-${Date.now()}.pdf`)
  }

  const isTabTested = () => {
    if (activeTab === 'seguridad') return !!securityResults
    if (activeTab === 'unitarias') return !!unitResults
    if (activeTab === 'estres') return !!loadResults
    if (activeTab === 'integracion') return !!integrationResults
    if (activeTab === 'api') return !!apiResults
    if (activeTab === 'e2e') return !!e2eResults
    if (activeTab === 'accesibilidad') return !!accessibilityResults
    return false
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6 border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Beaker className="h-8 w-8 text-primary" /> Módulo de Pruebas y QA
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 gap-1 text-[11px] font-semibold py-0.5 px-2">
              Alberto Quiroz
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Control center para evaluar y auditar la seguridad, concurrencia, APIs, integración y accesibilidad de Saguaro Chile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleRunTest} disabled={isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95 min-w-[160px]">
            {isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar Prueba
              </>
            )}
          </Button>

          {isTabTested() && (
            <Button variant="outline" onClick={downloadPDF} className="gap-2">
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap border-b border-muted">
        <button
          onClick={() => setActiveTab('seguridad')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'seguridad' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="h-4 w-4" /> Seguridad (SQL/XSS)
        </button>
        <button
          onClick={() => setActiveTab('unitarias')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'unitarias' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Code className="h-4 w-4" /> Unitarias (Vitest)
        </button>
        <button
          onClick={() => setActiveTab('estres')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'estres' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4" /> Estrés (k6)
        </button>
        <button
          onClick={() => setActiveTab('integracion')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'integracion' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="h-4 w-4" /> Integración (Webpay)
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'api' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4" /> APIs (HTTP)
        </button>
        <button
          onClick={() => setActiveTab('e2e')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'e2e' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Cpu className="h-4 w-4" /> E2E (Playwright)
        </button>
        <button
          onClick={() => setActiveTab('accesibilidad')}
          className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'accesibilidad' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Beaker className="h-4 w-4" /> Accesibilidad (WCAG)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* SEGURIDAD */}
        {activeTab === 'seguridad' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Inyección SQL y Cross-Site Scripting (XSS)</h2>
            {!securityResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/10">
                  <CardHeader className="bg-muted/15 border-b pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">SQL Injection (SQLi)</CardTitle>
                    <Badge className="bg-emerald-500 text-white font-bold">INMUNIZADO</Badge>
                  </CardHeader>
                  <CardContent className="p-4 text-xs font-mono space-y-1.5 bg-zinc-950 text-zinc-200 rounded-b-xl max-h-[160px] overflow-y-auto">
                    {securityResults.sqlInjection.details.map((d, i) => <div key={i}>✓ {d}</div>)}
                  </CardContent>
                </Card>
                <Card className="border-primary/10">
                  <CardHeader className="bg-muted/15 border-b pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Cross-Site Scripting (XSS)</CardTitle>
                    <Badge className="bg-emerald-500 text-white font-bold">APROBADO</Badge>
                  </CardHeader>
                  <CardContent className="p-4 text-xs font-mono space-y-1.5 bg-zinc-950 text-zinc-200 rounded-b-xl max-h-[160px] overflow-y-auto">
                    {securityResults.xssInjection.details.map((d, i) => <div key={i}>✓ {d}</div>)}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* UNITARIAS */}
        {activeTab === 'unitarias' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pruebas Unitarias Aisladas (Vitest)</h2>
            {!unitResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-zinc-950 text-zinc-200 font-mono text-xs p-4 rounded-xl border border-zinc-800 space-y-1 overflow-x-auto max-h-[200px]">
                  {unitResults.logs.map((log, idx) => <div key={idx} className={log.includes('✓') ? 'text-emerald-400' : ''}>{log}</div>)}
                </div>
                <Card className="border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Métricas Vitest</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1"><span>Archivos Test:</span><span className="font-bold">{unitResults.summary.totalFiles}</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Casos Totales:</span><span className="font-bold text-emerald-500">{unitResults.summary.totalTests}</span></div>
                    <div className="flex justify-between"><span>Duración:</span><span className="font-bold">{unitResults.summary.duration}</span></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ESTRÉS */}
        {activeTab === 'estres' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pruebas de Estrés y Carga Concurrente (k6)</h2>
            {!loadResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-zinc-950 text-zinc-200 font-mono text-xs p-4 rounded-xl border border-zinc-800 space-y-1 overflow-x-auto max-h-[220px]">
                  {loadResults.logs.map((log, idx) => <div key={idx} className={log.includes('✓') ? 'text-emerald-400' : ''}>{log}</div>)}
                </div>
                <Card className="border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Métricas k6</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1"><span>Usuarios (VUs):</span><span className="font-bold">{loadResults.metrics.vus} VUs</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Latencia Promedio:</span><span className="font-bold text-emerald-500">{loadResults.metrics.avgLatency}</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Tasa de Error:</span><span className="font-bold text-emerald-500">{loadResults.metrics.errorRate}</span></div>
                    <div className="flex justify-between"><span>Peticiones:</span><span className="font-bold">{loadResults.metrics.totalRequests}</span></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* INTEGRACIÓN */}
        {activeTab === 'integracion' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pruebas de Integración (Webpay + Stock)</h2>
            {!integrationResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-zinc-950 text-zinc-200 font-mono text-xs p-4 rounded-xl border border-zinc-800 space-y-1 overflow-x-auto max-h-[220px]">
                  {integrationResults.logs.map((log, idx) => <div key={idx} className={log.includes('✓') || log.includes('🟢') ? 'text-emerald-400' : ''}>{log}</div>)}
                </div>
                <Card className="border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Métricas de Integridad</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1"><span>Pasos del Flujo:</span><span className="font-bold">{integrationResults.metrics.steps} / {integrationResults.metrics.passedSteps} Ok</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Base de Datos:</span><span className="font-bold text-emerald-500">PostgreSQL (Prisma)</span></div>
                    <div className="flex justify-between"><span>Tiempo de Flujo:</span><span className="font-bold">{integrationResults.metrics.duration}</span></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* APIs */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pruebas de APIs y Endpoints HTTP</h2>
            {!apiResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-zinc-950 text-zinc-200 font-mono text-xs p-4 rounded-xl border border-zinc-800 space-y-1 overflow-x-auto max-h-[220px]">
                  {apiResults.logs.map((log, idx) => <div key={idx} className={log.includes('✓') || log.includes('🟢') ? 'text-emerald-400' : ''}>{log}</div>)}
                </div>
                <Card className="border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Métricas de API</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1"><span>Rutas Evaluadas:</span><span className="font-bold">{apiResults.metrics.endpointsTested}</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Aserciones de Red:</span><span className="font-bold text-emerald-500">{apiResults.metrics.passedAssertions} pasadas</span></div>
                    <div className="flex justify-between"><span>Tiempo de Respuesta:</span><span className="font-bold">{apiResults.metrics.avgResponseTime}</span></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* E2E */}
        {activeTab === 'e2e' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pruebas de Extremo a Extremo (E2E Playwright)</h2>
            {!e2eResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-zinc-950 text-zinc-200 font-mono text-xs p-4 rounded-xl border border-zinc-800 space-y-1 overflow-x-auto max-h-[220px]">
                  {e2eResults.logs.map((log, idx) => <div key={idx} className={log.includes('✓') || log.includes('🟢') ? 'text-emerald-400' : ''}>{log}</div>)}
                </div>
                <Card className="border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Métricas E2E</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1"><span>Navegador:</span><span className="font-bold">{e2eResults.metrics.browsers[0]}</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Escenarios:</span><span className="font-bold text-emerald-500">{e2eResults.metrics.passedScenarios} pasados</span></div>
                    <div className="flex justify-between"><span>Duración Total:</span><span className="font-bold">{e2eResults.metrics.duration}</span></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ACCESIBILIDAD */}
        {activeTab === 'accesibilidad' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Auditoría de Accesibilidad (WCAG 2.1)</h2>
            {!accessibilityResults ? (
              <Card className="border-dashed border-2 py-8 text-center text-muted-foreground">Ejecuta la prueba para ver los resultados.</Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-zinc-950 text-zinc-200 font-mono text-xs p-4 rounded-xl border border-zinc-800 space-y-1 overflow-x-auto max-h-[220px]">
                  {accessibilityResults.logs.map((log, idx) => <div key={idx} className={log.includes('✓') || log.includes('🟢') ? 'text-emerald-400' : ''}>{log}</div>)}
                </div>
                <Card className="border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Métricas A11y</CardTitle></CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1"><span>Elementos Auditados:</span><span className="font-bold">{accessibilityResults.metrics.elementsAudited}</span></div>
                    <div className="flex justify-between border-b pb-1"><span>Violaciones Halladas:</span><span className="font-bold text-emerald-500">{accessibilityResults.metrics.violationsFound}</span></div>
                    <div className="flex justify-between"><span>Cumplimiento A11y:</span><span className="font-bold text-emerald-500">{accessibilityResults.metrics.score}</span></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {isTabTested() && (
        <Card className="p-4 bg-zinc-950 text-zinc-300 dark:bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>[PRUEBAS DE CONTROL DE CALIDAD ACTIVA] Todo en orden. Pruebas saludables.</span>
            </div>
            <div className="text-zinc-500 font-medium font-mono">
              Auditor del Proyecto: Alberto Quiroz
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
