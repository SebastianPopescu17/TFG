import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { PollingService } from '../../../core/services/polling.service';
import { Api } from '../../../core/services/api.service';
import { Alerta } from '../../../core/models/alerta';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-alertas-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './alertas-list.component.html',
  styleUrls: ['./alertas-list.component.css']
})
export class AlertasListComponent implements OnInit {
  alertas: Alerta[] = [];
  userId: number | null = null;

  constructor(
    private polling: PollingService,
    private api: Api,
    private auth: AuthService,
    private notificacion: NotificacionService
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getCurrentUserId();

    if (this.userId) {
      this.api.getAlertas(this.userId).subscribe({
        next: (data: Alerta[]) => {
          this.alertas = data;
        },
        error: (err) => console.error('Error cargando alertas', err)
      });


      this.polling.alertas$.subscribe(alertas => {
        if (alertas && alertas.length) {
          this.alertas = alertas;

          alertas.forEach(a => {
            if (!a.activa) {
              const alertaLocal = this.alertas.find(al => al.id === a.id);
              if (alertaLocal && alertaLocal.activa) {
                alertaLocal.activa = false;
                this.notificacion.mostrar(
                  `🔔 La alerta de la empresa ${a.empresa?.nombre ?? 'X'} se ha cumplido`
                );
              }
            }
          });
        }
      });
    }
  }

  eliminarAlerta(id: number): void {
    if (!this.userId) return;
    this.api.deleteAlerta(this.userId, id).subscribe({
      next: () => (this.alertas = this.alertas.filter(a => a.id !== id)),
      error: (err: unknown) => console.error('Error eliminando alerta', err)
    });
  }
}
