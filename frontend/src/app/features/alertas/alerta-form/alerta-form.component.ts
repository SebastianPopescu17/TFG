import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { Empresa } from '../../../core/models/empresa';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alerta-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './alerta-form.component.html',
  styleUrls: ['./alerta-form.component.css']
})
export class AlertaFormComponent implements OnInit {
  userId: number | null = null;
  empresaId: number | null = null;
  tipo: 'precio' = 'precio';
  condicion: 'mayor' | 'menor' | 'igual' = 'mayor';
  valor = 0;
  activa = true;

  empresas: Empresa[] = [];

  constructor(
    private api: Api,
    private auth: AuthService,
    private dialogRef: MatDialogRef<AlertaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresaId: number }
  ) {
    this.userId = this.auth.getCurrentUserId();
    this.empresaId = data.empresaId;
  }

  ngOnInit() {
    this.api.getEmpresas().subscribe(data => {
      this.empresas = data.data;
    });
  }

  crearAlerta() {
    if (!this.userId || !this.empresaId) return;

    const data = {
      empresa_id: this.empresaId,
      tipo: this.tipo,
      condicion: this.condicion,
      valor: this.valor,
      activa: this.activa
    };

    this.api.createAlerta(this.userId, data).subscribe({
      next: (alertaCreada) => {
        this.dialogRef.close(alertaCreada);
      },
      error: (err) => {
        console.error('Error creando alerta', err);
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
