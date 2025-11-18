
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private snackBar: MatSnackBar) {}

  mostrar(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['alerta-snackbar']
    });
  }
}
