import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../../core/services/api.service';

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

  constructor(private api: Api, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarSaldo();
    this.cargarMovimientos();
  }

  cargarSaldo(): void {
    this.api.getSaldo().subscribe({
      next: res => this.saldo = res.saldo,
      error: () => this.snackBar.open('Error cargando saldo ❌', 'Cerrar', { duration: 3000 })
    });
  }

  cargarMovimientos(page: number = 1): void {
    this.api.getMovimientosSaldo(page).subscribe({
      next: res => {
        this.movimientos = res.data ?? [];
        this.totalMovimientos = res.total ?? this.movimientos.length;
      },
      error: () => this.snackBar.open('Error cargando movimientos ❌', 'Cerrar', { duration: 3000 })
    });
  }

  ingresar(): void {
    if (this.monto <= 0) return;
    this.api.ingresarSaldo(this.monto).subscribe({
      next: res => {
        this.saldo = res.saldo;
        this.snackBar.open('Saldo ingresado ✅', 'Cerrar', { duration: 3000 });
        this.monto = 0;
        this.cargarMovimientos();
      }
    });
  }

  retirar(): void {
    if (this.monto <= 0) return;
    this.api.retirarSaldo(this.monto).subscribe({
      next: res => {
        this.saldo = res.saldo;
        this.snackBar.open('Saldo retirado ✅', 'Cerrar', { duration: 3000 });
        this.monto = 0;
        this.cargarMovimientos();
      },
      error: err => {
        this.snackBar.open(err?.error?.error || 'Saldo insuficiente ❌', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.cargarMovimientos(event.pageIndex + 1);
  }
}
