import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Empresa } from '../../../core/models/empresa';
import { IndicadorFinanciero } from '../../../core/models/indicador-financiero';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { PollingService } from '../../../core/services/polling.service';
import { Api } from '../../../core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { AlertaFormComponent } from '../../alertas/alerta-form/alerta-form.component';
import { OrdenDialogComponent } from '../../orden-dialog/orden-dialog.component';
import { MensajeDialogComponent } from '../../mensaje-dialog/mensaje-dialog.component';
import { ConfirmarDialogComponent } from '../../confirmar-dialog/confirmar-dialog.component';


@Component({
  selector: 'app-empresa-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatListModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    BaseChartDirective,
  ],
  templateUrl: './empresa-detail.component.html',
  styleUrls: ['./empresa-detail.component.css'],
})
export class EmpresaDetailComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  empresa?: Empresa;
  indicadores: IndicadorFinanciero[] = [];
  private sub?: Subscription;
  loading = true;
  saldo = 0;

  lineData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        type: 'line',
        label: 'Precio',
        data: [] as { x: number; y: number }[],
        borderColor: '#FF00FF',
        fill: true,
        tension: 0.2,
        pointRadius: 0,
      },
      {
        type: 'line',
        label: 'Cambios',
        data: [] as { x: number; y: number; sube: boolean }[],
        borderColor: '#000',
        backgroundColor: (ctx) => {
          const value = ctx.raw as any;
          return value?.sube ? '#4CAF50' : '#F44336';
        },
        pointRadius: 0,
        showLine: false,
      },
    ],
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    animation: false,
    plugins: {
      legend: { display: true },
      datalabels: {
        display: false,
        align: 'top',
        color: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex] as any;
          return value?.sube ? '#4CAF50' : '#F44336';
        },
        font: { weight: 'bold' },
        formatter: (value: any) => value.y,
      },
    },
    scales: {
      x: { type: 'time', time: { unit: 'second' },  grid: { display: false }, ticks: { color: '#666' } },
      y: { beginAtZero: false, grid: { display: false }, ticks: { color: '#666' }},
    },
  };

  displayedColumns: string[] = [
    'fecha',
    'roe',
    'roa',
    'margen',
    'deuda',
    'ingresos',
    'beneficio',
    'eps',
  ];
  precioSube: boolean | null = null;
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private polling: PollingService,
    private api: Api,
    private auth: AuthService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    const ticker = this.route.snapshot.paramMap.get('ticker');
    if (!ticker) return;

    this.userId = this.auth.getCurrentUserId();
    this.loading = true;

    // Registrar Chart.js dinámicamente para reducir el bundle inicial
    try {
      const { Chart, registerables } = await import('chart.js');
      const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default;
      await import('chartjs-adapter-date-fns');
      Chart.register(...registerables, ChartDataLabels);
    } catch (err) {
      // Si la carga dinámica falla, continuar sin crash (los gráficos fallarán hasta recargar)
      console.warn('No se pudo registrar Chart.js dinámicamente:', err);
    }

    this.api.getEmpresa(ticker).subscribe({
      next: (empresa: Empresa & { historicoPrecios?: { fecha: string; valor: any }[] }) => {
        this.empresa = empresa;
        this.indicadores = empresa.indicadoresFinancieros ?? [];
        this.loading = false;


        this.lineData.datasets[0].data = (empresa.historicoPrecios ?? []).map((p) => ({
          x: new Date(p.fecha).getTime(),
          y: Number(p.valor) || 0,
        }));

        this.lineData.datasets[1].data = [];
        this.chart?.update();
      },
      error: () => (this.loading = false),
    });


    this.api.getSaldo().subscribe({
      next: (res) => (this.saldo = Number(res.saldo) || 0),
      error: () => (this.saldo = 0),
    });


    this.polling.startForTicker(ticker);
    this.sub = this.polling.empresa$.subscribe((empresa) => {
      if (!empresa) return;

      const nuevoPrecio = Number(empresa.precio_actual) || 0;
      const ahora = new Date().getTime();


      this.lineData.datasets[0].data = [
        ...this.lineData.datasets[0].data,
        { x: ahora, y: nuevoPrecio },
      ].slice(-200);


      if ((this.empresa?.precio_actual ?? 0) !== nuevoPrecio) {
        const sube = nuevoPrecio > (this.empresa?.precio_actual ?? 0);
        this.lineData.datasets[1].data = [
          ...this.lineData.datasets[1].data,
          { x: ahora, y: nuevoPrecio, sube },
        ].slice(-200);
        this.precioSube = sube;
      }

      this.empresa = { ...this.empresa, ...empresa };
      this.chart?.update();
    });
  }

  ngOnDestroy(): void {
    this.polling.stop();
    this.sub?.unsubscribe();
  }

 agregarAWathlist(): void {
  if (!this.userId || !this.empresa) return;


  this.api.getWatchlist().subscribe({
    next: (empresas: Empresa[]) => {
      const yaExiste = empresas.some(e => e.ticker === this.empresa!.ticker);

      if (yaExiste) {
        this.dialog.open(MensajeDialogComponent, {
          width: '400px',
          data: {
            titulo: 'Aviso',
            mensaje: `${this.empresa?.nombre} ya está en tu watchlist ⚠️`,
            tipo: 'info',
          },
        });
        return;
      }


      this.dialog.open(ConfirmarDialogComponent, {
        data: {
          title: 'Confirmar acción',
          message: `¿Seguro que quieres añadir ${this.empresa?.nombre} a tu watchlist?`,
        },
      }).afterClosed().subscribe((result) => {
        if (result) {
          this.api.addToWatchlist(this.empresa!.ticker).subscribe({
            next: () => {
              this.dialog.open(MensajeDialogComponent, {
                width: '400px',
                data: {
                  titulo: 'Acción completada',
                  mensaje: `${this.empresa?.nombre} añadida a tu watchlist ✅`,
                  tipo: 'success',
                },
              });
            },
            error: (err) => {
              if (err.status === 409) {
                this.dialog.open(MensajeDialogComponent, {
                  width: '400px',
                  data: {
                    titulo: 'Aviso',
                    mensaje: `${this.empresa?.nombre} ya estaba en tu watchlist ⚠️`,
                    tipo: 'info',
                  },
                });
              } else {
                this.dialog.open(MensajeDialogComponent, {
                  width: '400px',
                  data: {
                    titulo: 'Error',
                    mensaje: 'Error al añadir la empresa ❌',
                    tipo: 'error',
                  },
                });
              }
            },
          });
        }
      });
    },
    error: () => {
      this.dialog.open(MensajeDialogComponent, {
        width: '400px',
        data: {
          titulo: 'Error',
          mensaje: 'No se pudo comprobar la watchlist ❌',
          tipo: 'error',
        },
      });
    }
  });
}


  abrirDialogoAlerta(): void {
    if (!this.userId || !this.empresa) return;

    const dialogRef = this.dialog.open(AlertaFormComponent, {
      width: '500px',
      data: { empresaId: this.empresa!.id },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dialog.open(MensajeDialogComponent, {
          width: '400px',
          data: {
            titulo: 'Alerta creada',
            mensaje: `Alerta creada para ${this.empresa?.nombre}`,
            tipo: 'success',
          },
        });
      }
    });
  }

  abrirCompra(): void {
    if (!this.empresa) return;
    const precio = Number(this.empresa.precio_actual) || 0;

    this.dialog
      .open(ConfirmarDialogComponent, {
        data: {
          title: 'Confirmar compra',
          message: `¿Seguro que quieres comprar acciones de ${this.empresa?.nombre} al precio de ${precio} €?`,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const ref = this.dialog.open(OrdenDialogComponent, {
            width: '420px',
            data: { tipo: 'compra', precio, empresa: this.empresa },
          });

          ref.afterClosed().subscribe((order) => {
            if (!order) return;

            const coste = order.cantidad * precio;
            if (coste > this.saldo) {
              this.dialog.open(MensajeDialogComponent, {
                width: '400px',
                data: { titulo: 'Error', mensaje: 'Saldo insuficiente ❌', tipo: 'error' },
              });
              return;
            }

            this.api
              .comprar({ empresa_id: this.empresa!.id, cantidad: order.cantidad, precio })
              .subscribe({
                next: () => {
                  this.dialog.open(MensajeDialogComponent, {
                    width: '400px',
                    data: {
                      titulo: 'Compra ejecutada',
                      mensaje: 'La operación se realizó correctamente ✅',
                      tipo: 'success',
                    },
                  });
                  this.saldo -= coste;
                },
                error: () => {
                  this.dialog.open(MensajeDialogComponent, {
                    width: '400px',
                    data: { titulo: 'Error', mensaje: 'Error ejecutando compra ❌', tipo: 'error' },
                  });
                },
              });
          });
        }
      });
  }
}
