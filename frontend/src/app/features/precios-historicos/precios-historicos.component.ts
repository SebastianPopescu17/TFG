import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { ChartOptions, ChartData, ChartType } from 'chart.js';
import { Api } from '../../core/services/api.service';
import { PrecioHistorico } from '../../core/models/precio-historico';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-precios-historicos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    BaseChartDirective,
  ],
  templateUrl: './precios-historicos.component.html',
  styleUrls: ['./precios-historicos.component.css'],
})
export class PreciosHistoricosComponent implements OnInit {
  empresas: { id: number; nombre: string }[] = [];
  empresaSeleccionadaId!: number;

  precios: PrecioHistorico[] = [];
  cargando: boolean = false;
  error: string = '';

  desde: string = '';
  hasta: string = '';

  displayedColumns = ['fecha', 'apertura', 'maximo', 'minimo', 'cierre'];

  // Configuración del gráfico
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cierre',
        fill: false,
        borderColor: '#3f51b5',
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: true },
      datalabels: {display: false},
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };
  public lineChartType: ChartType = 'line';

  constructor(private api: Api) {}

  async ngOnInit(): Promise<void> {

    try {
      const { Chart, registerables } = await import('chart.js');
      const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default;
      Chart.register(...registerables, ChartDataLabels);
      await import('chartjs-adapter-date-fns');
    } catch (err) {
      console.warn('No se pudo cargar Chart.js dinámicamente:', err);
    }

    this.cargarEmpresas();
  }

  private cargarEmpresas(): void {
    this.api.getEmpresas().subscribe({
      next: (res) => {
        this.empresas = res.data.map((e) => ({ id: e.id, nombre: e.nombre }));
        if (this.empresas.length) {
          this.empresaSeleccionadaId = this.empresas[0].id;
          this.cargarPrecios();
        }
      },
      error: (err) => {
        console.error('Error cargando empresas:', err);
        this.error = 'No se pudieron cargar las empresas.';
      },
    });
  }

  cargarPrecios(): void {
    if (!this.empresaSeleccionadaId) return;

    this.cargando = true;
    this.error = '';

    const params: any = {};
    if (this.desde) params.desde = this.desde;
    if (this.hasta) params.hasta = this.hasta;

    this.api.getPreciosHistoricos(this.empresaSeleccionadaId, params).subscribe({
      next: (data) => {
        this.precios = data;
        this.actualizarGrafico();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando precios históricos:', err);
        this.error = 'No se pudieron cargar los precios históricos.';
        this.cargando = false;
      },
    });
  }

  private actualizarGrafico(): void {
  const labels = this.precios.map((p) => new Date(p.fecha).toLocaleDateString());
  const data = this.precios.map((p) => p.cierre);

  this.lineChartData = {
    labels,
    datasets: [
      {
        data,
        label: `Cierre ${this.empresas.find(e => e.id === this.empresaSeleccionadaId)?.nombre}`,
        fill: false,
        borderColor: '#3f51b5',
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };
}

}
