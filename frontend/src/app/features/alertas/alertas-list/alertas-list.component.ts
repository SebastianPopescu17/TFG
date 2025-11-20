import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { Api } from '../../../core/services/api.service';
import { Alerta } from '../../../core/models/alerta';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AlertasService } from '../../../core/services/alertas-service';

@Component({
  selector: 'app-alertas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './alertas-list.component.html',
  styleUrls: ['./alertas-list.component.css']
})
export class AlertasListComponent implements OnInit {
  alertas: Alerta[] = [];
  userId: number | null = null;

  constructor(
    private api: Api,
    private auth: AuthService,
    private alertasService: AlertasService
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getCurrentUserId();

    if (this.userId) {
      this.alertasService.alertas$.subscribe((alertas: Alerta[]) => {
        this.alertas = alertas;
      });


      this.api.getAlertas(this.userId).subscribe({
        next: (alertas) => this.alertasService.setAlertas(alertas),
        error: (err) => console.error('Error cargando alertas', err)
      });
    }
  }

  eliminarAlerta(id: number): void {
    if (!this.userId) return;
    this.api.deleteAlerta(this.userId, id).subscribe({
      next: () => {
       
        this.alertas = this.alertas.filter(a => a.id !== id);
        this.alertasService.setAlertas(this.alertas);
      },
      error: (err: unknown) => console.error('Error eliminando alerta', err)
    });
  }
}
