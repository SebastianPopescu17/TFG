import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Api } from '../../core/services/api.service';
import { MensajeDialogComponent } from '../mensaje-dialog/mensaje-dialog.component';

interface Movimiento {
  created_at: string;
  tipo: 'ingreso' | 'retiro';
  monto: number;
  saldo_resultante: number;
}

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './saldo.component.html',
  styleUrls: ['./saldo.component.css']
})
export class SaldoComponent implements OnInit {
  saldo = 0;
  monto = 0;
  movimientos: Movimiento[] = [];
  displayedColumns = ['fecha', 'tipo', 'monto', 'saldo_resultante'];
  totalMovimientos = 0;

  constructor(private api: Api, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarSaldo();
    this.cargarMovimientos();
  }

  private abrirDialogo(titulo: string, mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.dialog.open(MensajeDialogComponent, {
      data: { titulo, mensaje, tipo }
    });
  }

  cargarSaldo(): void {
    this.api.getSaldo().subscribe({
      next: res => this.saldo = res.saldo,
      error: () => this.abrirDialogo('Error', 'Error cargando saldo ❌', 'error')
    });
  }

  cargarMovimientos(page: number = 1): void {
    this.api.getMovimientosSaldo(page).subscribe({
      next: res => {
        this.movimientos = res.data ?? [];
        this.totalMovimientos = res.total ?? this.movimientos.length;
      },
      error: () => this.abrirDialogo('Error', 'Error cargando movimientos ❌', 'error')
    });
  }

  ingresar(): void {
    if (this.monto <= 0) return;
    this.api.ingresarSaldo(this.monto).subscribe({
      next: res => {
        this.saldo = res.saldo;
        this.abrirDialogo('Éxito', 'Saldo ingresado ✅', 'success');
        this.monto = 0;
        this.cargarMovimientos();
      },
      error: () => this.abrirDialogo('Error', 'No se pudo ingresar saldo ❌', 'error')
    });
  }

  retirar(): void {
    if (this.monto <= 0) return;
    this.api.retirarSaldo(this.monto).subscribe({
      next: res => {
        this.saldo = res.saldo;
        this.abrirDialogo('Éxito', 'Saldo retirado ✅', 'success');
        this.monto = 0;
        this.cargarMovimientos();
      },
      error: err => {
        this.abrirDialogo('Error', err?.error?.error || 'Saldo insuficiente ❌', 'error');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.cargarMovimientos(event.pageIndex + 1);
  }
}
