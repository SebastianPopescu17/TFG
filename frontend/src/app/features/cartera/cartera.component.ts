import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { Api } from '../../core/services/api.service';
import { PollingService } from '../../core/services/polling.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { VentaDialogComponent } from '../venta-dialog/venta-dialog.component';
import { Posicion, Resumen } from '../../core/models/cartera';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MensajeDialogComponent } from '../mensaje-dialog/mensaje-dialog.component';

@Component({
  selector: 'app-cartera',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './cartera.component.html',
  styleUrls: ['./cartera.component.css'],
})
export class CarteraComponent implements OnInit, OnDestroy {
  resumen: Resumen = {
    total_invertido: 0,
    total_actual: 0,
    rentabilidad_total: 0,
    rentabilidad_pct: 0,
  };
  detalle: Posicion[] = [];
  loading = true;
  sub?: Subscription;
  constructor(
    private api: Api,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private polling: PollingService
  ) {}
  ngOnInit(): void {
    this.refrescar();
    this.polling.startGlobal();
    this.sub = this.polling.empresas$.subscribe((empresas) => {
      this.detalle.forEach((pos) => {
        const empresa = empresas.find((e) => e.id === pos.empresa_id);
        if (empresa) {
          pos.precio_actual = empresa.precio_actual ?? pos.precio_actual;
        }
        this.actualizarPosicion(pos);
      });
      this.resumen = this.calcularResumen(this.detalle);
    });
  }
  refrescar(): void {
  this.loading = true;
  this.api.getCartera().subscribe({
    next: (data: any) => {
      console.log('Respuesta de /cartera:', data);
      this.detalle = (data.detalle ?? []).map((pos: any) => ({
        empresa_id: pos.empresa_id,
        empresa: pos.empresa,
        ticker: pos.ticker,
        cantidad: pos.cantidad,
        precio_medio: pos.precio_medio,
        precio_actual: pos.precio_actual,
        valor_invertido: pos.cantidad * pos.precio_medio,
        valor_actual: pos.cantidad * pos.precio_actual,
        rentabilidad: pos.cantidad * (pos.precio_actual - pos.precio_medio),
        rentabilidad_pct: pos.precio_medio > 0
          ? ((pos.precio_actual - pos.precio_medio) / pos.precio_medio) * 100
          : 0
      } as Posicion));
      this.resumen = this.calcularResumen(this.detalle);
      this.loading = false;
    },
    error: () => this.loading = false,
  });
}

  abrirVenta(pos: Posicion): void {
  const ref = this.dialog.open(VentaDialogComponent, {
    width: '400px',
    data: { ticker: pos.ticker, cantidad: pos.cantidad, precio: pos.precio_actual },
  });

  ref.afterClosed().subscribe((cantidad: number) => {
    if (!cantidad) return;

    this.api.vender({ empresa_id: pos.empresa_id, cantidad, precio: pos.precio_actual }).subscribe({
      next: () => {
       
        this.dialog.open(MensajeDialogComponent, {
          width: '400px',
          data: {
            titulo: 'Venta realizada',
            mensaje: `Vendidas ${cantidad} acciones de ${pos.ticker} a ${pos.precio_actual} € ✅`,
            tipo: 'success'
          }
        });

        // Actualizar posición en memoria
        pos.cantidad -= cantidad;
        this.actualizarPosicion(pos);
        if (pos.cantidad <= 0) {
          this.detalle = this.detalle.filter(p => p.empresa_id !== pos.empresa_id);
        }
        this.resumen = this.calcularResumen(this.detalle);
      },
      error: (err) => {
        // 👇 Mostrar diálogo de error
        this.dialog.open(MensajeDialogComponent, {
          width: '400px',
          data: {
            titulo: 'Error en la venta',
            mensaje: err?.error?.error || 'Error al vender ❌',
            tipo: 'error'
          }
        });
      },
    });
  });
}

  private actualizarPosicion(pos: Posicion) {
    pos.valor_invertido = pos.cantidad * pos.precio_medio;
    pos.valor_actual = pos.cantidad * pos.precio_actual;
    pos.rentabilidad = pos.valor_actual - pos.valor_invertido;
    pos.rentabilidad_pct =
      pos.valor_invertido > 0 ? (pos.rentabilidad / pos.valor_invertido) * 100 : 0;
  }
  private calcularResumen(detalle: Posicion[]): Resumen {
    const total_invertido = detalle.reduce((acc, p) => acc + p.valor_invertido, 0);
    const total_actual = detalle.reduce((acc, p) => acc + p.valor_actual, 0);
    return {
      total_invertido,
      total_actual,
      rentabilidad_total: total_actual - total_invertido,
      rentabilidad_pct:
        total_invertido > 0 ? ((total_actual - total_invertido) / total_invertido) * 100 : 0,
    };
  }
  trackById(index: number, item: Posicion) {
    return item.empresa_id;
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
