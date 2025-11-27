import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-generar-pdf',
  standalone: true,
  imports: [],
  templateUrl: './generar-pdf.component.html',
  styleUrls: ['./generar-pdf.component.css'],
})
export class GenerarPdfComponent {
  @Input() operaciones: any[] = [];
  generatingPdf = false;

  // Normaliza las operaciones para que siempre tengan los campos necesarios
  private normalizarOperaciones() {
    return this.operaciones.map(op => ({
      created_at: op.created_at,
      tipo: (op.tipo ?? '').toLowerCase(),
      cantidad: Number(op.cantidad ?? 0),
      precio: Number(op.precio ?? 0),
      importe: Number(op.importe ?? (op.cantidad ?? 0) * (op.precio ?? 0)),
      plusvalia: Number(op.plusvalia ?? 0),
      empresa: op.empresa ?? { nombre: op.nombreEmpresa ?? '-', ticker: op.ticker ?? '-' },
      ticker: op.empresa?.ticker ?? op.ticker ?? 'N/A'
    }));
  }

  private calcularResumen() {
    const ops = this.normalizarOperaciones();
    const totalOperaciones = ops.length;
    const totalInvertido = ops.filter(op => op.tipo === 'compra').reduce((s, op) => s + op.importe, 0);
    const totalRecuperado = ops.filter(op => op.tipo === 'venta').reduce((s, op) => s + op.importe, 0);
    const plusvaliaTotal = ops.reduce((s, op) => s + op.plusvalia, 0);

    const byTicker = new Map<string, { cantidad: number; importe: number; plusvalia: number }>();
    const byYear: Record<number, { importe: number; count: number }> = {};

    for (const op of ops) {
      const current = byTicker.get(op.ticker) ?? { cantidad: 0, importe: 0, plusvalia: 0 };
      current.cantidad += op.cantidad;
      current.importe += op.importe;
      current.plusvalia += op.plusvalia;
      byTicker.set(op.ticker, current);

      const date = op.created_at ? new Date(op.created_at) : null;
      if (date && !isNaN(date.getTime())) {
        const y = date.getFullYear();
        byYear[y] = byYear[y] ?? { importe: 0, count: 0 };
        byYear[y].importe += op.importe;
        byYear[y].count += 1;
      }
    }

    return { totalOperaciones, totalInvertido, totalRecuperado, plusvaliaTotal, byTicker, byYear };
  }

  private async crearGraficoBarras(labels: string[], valores: number[]): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto 2D');

    const { Chart, registerables } = await import('chart.js');
    const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default;
    Chart.register(...registerables, ChartDataLabels);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Importe (€)',
          data: valores,
          backgroundColor: 'rgba(30, 80, 160, 0.7)',
          borderColor: 'rgba(30, 80, 160, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#000',
            anchor: 'end',
            align: 'top',
            formatter: (value) => (typeof value === 'number' ? value.toFixed(2) + ' €' : '0 €')
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => v + ' €' } },
          x: { ticks: { color: '#333' } }
        }
      },
      plugins: [ChartDataLabels]
    });

    await new Promise(res => setTimeout(res, 250));
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    chart.destroy();
    return dataUrl;
  }

  private async crearGraficoTorta(labels: string[], valores: (number | null)[]): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto 2D');

    const { Chart, registerables } = await import('chart.js');
    const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default;
    Chart.register(...registerables, ChartDataLabels);

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: valores.map(v => (typeof v === 'number' ? v : 0)),
          backgroundColor: [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
          ]
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'right' },
          datalabels: {
            formatter: (value, ctx) => {
              const rawData = ctx.chart.data.datasets[0].data ?? [];
              const numericData = rawData.map(v => (typeof v === 'number' ? v : 0));
              const total = numericData.reduce((a, b) => a + b, 0);
              const numericValue = typeof value === 'number' ? value : 0;
              return total > 0 ? ((numericValue / total) * 100).toFixed(1) + '%' : '0%';
            },
            color: '#fff',
            font: { weight: 'bold' },
          },
        },
      },
      plugins: [ChartDataLabels]
    });

    await new Promise(res => setTimeout(res, 250));
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    chart.destroy();
    return dataUrl;
  }

  async generarPDF(): Promise<void> {
    const ops = this.normalizarOperaciones();
    if (!ops || ops.length === 0) {
      alert('No hay operaciones para exportar.');
      return;
    }

    this.generatingPdf = true;
    try {
      const resumen = this.calcularResumen();
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // Título principal
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Operaciones', 40, 50);

      // Resumen estadístico
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total operaciones: ${resumen.totalOperaciones}`, 40, 75);
      doc.text(`• Total invertido (compras): ${resumen.totalInvertido.toFixed(2)} €`, 40, 95);
      doc.text(`• Total recuperado (ventas): ${resumen.totalRecuperado.toFixed(2)} €`, 40, 115);
      doc.text(`• Plusvalía global: ${resumen.plusvaliaTotal.toFixed(2)} €`, 40, 135);

      // Totales por ticker
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Totales por Ticker', 40, 165);
      const tickerRows = Array.from(resumen.byTicker.entries())
        .sort((a, b) => b[1].importe - a[1].importe)
        .map(([ticker, v]) => [ticker, v.cantidad.toFixed(2), v.importe.toFixed(2), v.plusvalia.toFixed(2)]);

      autoTable(doc, {
        startY: 185,
        head: [['Ticker', 'Cantidad', 'Importe', 'Plusvalía']],
        body: tickerRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 80, 160] },
      });
      let afterY = (doc as any).lastAutoTable?.finalY ?? 260;

      // Gráfico de barras por año
      const years = Object.keys(resumen.byYear).sort();
      if (years.length > 0) {
        const barImg = await this.crearGraficoBarras(years, years.map(y => resumen.byYear[Number(y)].importe));
        doc.addImage(barImg, 'PNG', 40, afterY + 10, 520, 240);
        afterY += 260;
      }

      // Gráfico de torta para top tickers
      const topTickers = Array.from(resumen.byTicker.entries())
        .sort((a, b) => b[1].importe - a[1].importe)
        .slice(0, 8);
      if (topTickers.length > 0) {
        const labels = topTickers.map(t => t[0]);
        const valores = topTickers.map(t => t[1].importe);
        const pieImg = await this.crearGraficoTorta(labels, valores);
        doc.addImage(pieImg, 'PNG', 40, afterY + 10, 300, 200);
      }

      // Tabla detallada
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tabla Detallada de Operaciones', 40, 40);
      const body = ops.map(op => [
        op.created_at ? new Date(op.created_at).toLocaleString() : '-',
        `${op.empresa.nombre} (${op.ticker})`,
        op.tipo.toUpperCase(),
        op.cantidad.toFixed(2),
        op.precio.toFixed(2),
        op.importe.toFixed(2),
        op.plusvalia.toFixed(2)
      ]);

      autoTable(doc, {
        startY: 65,
        head: [['Fecha', 'Empresa (Ticker)', 'Tipo', 'Cantidad', 'Precio', 'Importe', 'Plusvalía']],
        body,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [30, 80, 160], textColor: [255, 255, 255] },
        columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 6) {
            const val = parseFloat(String(data.cell.raw));
            if (!isNaN(val)) data.cell.styles.textColor = val >= 0 ? [22, 163, 74] : [220, 38, 38];
          }
        },
        didDrawPage: () => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const page = doc.getNumberOfPages();
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Página ${page}`, pageWidth - 60, pageHeight - 20);
        },
      });

      // Guardar PDF
      const filename = `resumen_operaciones_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`;
      doc.save(filename);

    } catch (err) {
      console.error('Error generando PDF', err);
      alert('Error generando PDF. Revisa la consola.');
    } finally {
      this.generatingPdf = false;
    }
  }
}
