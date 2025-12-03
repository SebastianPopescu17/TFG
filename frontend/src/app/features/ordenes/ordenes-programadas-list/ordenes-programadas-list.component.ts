import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../core/services/api.service';
import { OrdenesService } from '../../../core/services/ordenes.service';
import { Orden } from '../../../core/models/orden';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarDialogComponent } from '../../confirmar-dialog/confirmar-dialog.component';

@Component({
  selector: 'app-ordenes-programadas-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule],
  templateUrl: './ordenes-programadas-list.component.html',
  styleUrls: ['./ordenes-programadas-list.component.css'],
})
export class OrdenesProgramadasListComponent implements OnInit, OnDestroy {
  ordenes: Orden[] = [];
  subscription: Subscription = new Subscription();

  constructor(
    private ordenesService: OrdenesService,
    private api: Api,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscription = this.ordenesService.ordenes$.subscribe((ordenes: Orden[]) => {
      this.ordenes = ordenes;
    });
  }

  cancelar(id: number) {
    const ref = this.dialog.open(ConfirmarDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancelar orden',
        message: '¿Seguro que quieres cancelar esta orden?'
      }
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;

      this.api.cancelarOrden(id).subscribe({
        next: (ordenActualizada) => {
          console.log('[ListComponent] Orden cancelada recibida:', ordenActualizada);
          this.ordenesService.actualizarOrden(ordenActualizada);

          this.dialog.open(ConfirmarDialogComponent, {
            width: '400px',
            data: {
              title: 'Orden cancelada',
              message: `❌ Orden cancelada correctamente`
            }
          });
        },
        error: (err) => {
          this.dialog.open(ConfirmarDialogComponent, {
            width: '400px',
            data: {
              title: 'Error',
              message: err?.error?.error ?? 'Error cancelando la orden'
            }
          });
        }
      });
    });
  }

  eliminar(id: number) {
    const ref = this.dialog.open(ConfirmarDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar orden',
        message: '¿Seguro que quieres eliminar esta orden de la lista?'
      }
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;

      this.api.deleteOrden(id).subscribe({
        next: () => {
          this.ordenes = this.ordenes.filter(o => o.id !== id);
        },
        error: (err) => {
          this.dialog.open(ConfirmarDialogComponent, {
            width: '400px',
            data: {
              title: 'Error',
              message: err?.error?.error ?? 'Error eliminando la orden'
            }
          });
        }
      });
    });
  }

  isCancelada(orden: Orden): boolean {
    return (orden.estado ?? '').toLowerCase() === 'cancelada';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  estadoClass(estado: string) {
    switch (estado) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'cumplida':
        return 'estado-cumplida';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return '';
    }
  }
}
