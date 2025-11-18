import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatTableModule, FormsModule],
  templateUrl: './saldo.component.html',
  styleUrls: ['./saldo.component.css']
})
export class SaldoComponent implements OnInit {
  saldo = 0;
  monto = 0;
  movimientos: any[] = [];
  displayedColumns = ['fecha', 'tipo', 'monto', 'saldo_resultante'];

  constructor(private api: Api, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarSaldo();
    this.cargarMovimientos();
  }

  cargarSaldo(): void {
    this.api.getSaldo().subscribe(res => this.saldo = res.saldo);
  }

  cargarMovimientos(page: number = 1): void {
    this.api.getMovimientosSaldo(page).subscribe(res => {
      this.movimientos = res.data ?? [];
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
}
