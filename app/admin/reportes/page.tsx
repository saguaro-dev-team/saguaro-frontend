'use client'

import { useState } from 'react'
import { Download, Package, TrendingUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getReporteInventario, getReporteVentas } from '@/app/actions/reportes'

export default function ReportesPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loadingInventario, setLoadingInventario] = useState(false)
  const [loadingVentas, setLoadingVentas] = useState(false)
  const [loadingInventarioPDF, setLoadingInventarioPDF] = useState(false)
  const [loadingVentasPDF, setLoadingVentasPDF] = useState(false)

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No hay datos para este reporte.")
      return;
    }
    
    // Obtener las cabeceras
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? '' : row[header];
          // Escapar comillas dobles y envolver en comillas dobles
          cell = String(cell).replace(/"/g, '""');
          return `"${cell}"`;
        }).join(',')
      )
    ].join('\n');

    // Añadir BOM (Byte Order Mark) para que Excel reconozca correctamente la codificación UTF-8
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const downloadPDF = (data: any[], title: string, subtitle?: string) => {
    if (data.length === 0) {
      alert("No hay datos para este reporte.")
      return;
    }

    const headers = Object.keys(data[0]);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor permite los pop-ups para descargar el PDF.");
      return;
    }

    const rowsHtml = data.map((row, index) => {
      const cellsHtml = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        if (header.toLowerCase().includes('precio') || header.toLowerCase().includes('total')) {
          val = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(val));
        }
        return `<td>${val}</td>`;
      }).join('');
      return `<tr class="${index % 2 === 0 ? 'even' : 'odd'}">${cellsHtml}</tr>`;
    }).join('');

    const headersHtml = headers.map(h => `<th>${h}</th>`).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 40px;
            font-size: 11px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #10b981;
          }
          .title-area h1 {
            margin: 0;
            font-size: 20px;
            color: #111827;
          }
          .title-area p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 12px;
          }
          .meta-info {
            text-align: right;
            font-size: 11px;
            color: #4b5563;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f9fafb;
            color: #374151;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            border-bottom: 2px solid #e5e7eb;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
          }
          tr.even {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            color: #9ca3af;
            font-size: 10px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <span class="logo">Saguaro</span>
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
          </div>
          <div class="meta-info">
            <p><strong>Fecha Emisión:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Saguaro. Reporte generado automáticamente.</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  const handleDescargarInventario = async () => {
    setLoadingInventario(true)
    try {
      const data = await getReporteInventario()
      downloadCSV(data, `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el reporte.")
    } finally {
      setLoadingInventario(false)
    }
  }

  const handleDescargarInventarioPDF = async () => {
    setLoadingInventarioPDF(true)
    try {
      const data = await getReporteInventario()
      downloadPDF(data, "Reporte de Inventario de Bodega", "Listado de stock actual de productos")
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el reporte PDF.")
    } finally {
      setLoadingInventarioPDF(false)
    }
  }

  const handleDescargarVentas = async () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona ambas fechas.")
      return;
    }
    setLoadingVentas(true)
    try {
      const data = await getReporteVentas(startDate, endDate)
      downloadCSV(data, `reporte_ventas_${startDate}_al_${endDate}.csv`)
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el reporte.")
    } finally {
      setLoadingVentas(false)
    }
  }

  const handleDescargarVentasPDF = async () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona ambas fechas.")
      return;
    }
    setLoadingVentasPDF(true)
    try {
      const data = await getReporteVentas(startDate, endDate)
      downloadPDF(data, "Reporte de Ventas", `Período desde ${startDate} al ${endDate}`)
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el reporte PDF.")
    } finally {
      setLoadingVentasPDF(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Exporta información clave de tu tienda para contabilidad o análisis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventario */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Reporte de Inventario</CardTitle>
            </div>
            <CardDescription>
              Descarga un listado completo con el stock actual de todas las variantes (talla, color, modelo) de tu bodega.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDescargarInventario} disabled={loadingInventario} className="flex-1 sm:flex-none">
                <Download className="mr-2 h-4 w-4" />
                {loadingInventario ? 'Generando CSV...' : 'Descargar Inventario (CSV)'}
              </Button>
              <Button onClick={handleDescargarInventarioPDF} disabled={loadingInventarioPDF} variant="outline" className="flex-1 sm:flex-none">
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                {loadingInventarioPDF ? 'Generando PDF...' : 'Descargar Inventario (PDF)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ventas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Reporte de Ventas</CardTitle>
            </div>
            <CardDescription>
              Selecciona un rango de fechas para descargar todas las transacciones, pedidos y totales realizados en la tienda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Desde</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Hasta</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDescargarVentas} disabled={loadingVentas} className="flex-1 sm:flex-none">
                <Download className="mr-2 h-4 w-4" />
                {loadingVentas ? 'Generando CSV...' : 'Descargar Ventas (CSV)'}
              </Button>
              <Button onClick={handleDescargarVentasPDF} disabled={loadingVentasPDF} variant="outline" className="flex-1 sm:flex-none">
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                {loadingVentasPDF ? 'Generando PDF...' : 'Descargar Ventas (PDF)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
