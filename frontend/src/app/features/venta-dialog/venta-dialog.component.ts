import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ConfirmarDialogComponent } from '../confirmar-dialog/confirmar-dialog.component';

@Component({
  selector: 'app-venta-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './venta-dialog.component.html',
  styleUrls: ['./venta-dialog.component.css']
})
export class VentaDialogComponent {
  cantidad: number = 0;

  constructor(
    public dialogRef: MatDialogRef<VentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticker: string; cantidad: number; precio: number },
    private dialog: MatDialog
  ) {}

  confirmarVenta() {
    this.dialog.open(ConfirmarDialogComponent, {
      data: {
        title: 'Confirmar venta',
        message: `¿Seguro que quieres vender ${this.cantidad} acciones de ${this.data.ticker}?`
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close(this.cantidad);
      }
    });
  }
}
