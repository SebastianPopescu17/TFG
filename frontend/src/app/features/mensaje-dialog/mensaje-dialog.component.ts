import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mensaje-dialog',
  standalone: true,
  imports: [
    CommonModule,       
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './mensaje-dialog.component.html',
  styleUrls: ['./mensaje-dialog.component.css']
})
export class MensajeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MensajeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { titulo: string; mensaje: string; tipo?: 'success' | 'error' }
  ) {}
}
