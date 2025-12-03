import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alerta } from '../models/alerta';
import { Empresa } from '../models/empresa';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private alertasSubject = new BehaviorSubject<Alerta[]>([]);
  alertas$: Observable<Alerta[]> = this.alertasSubject.asObservable();

  private alertasCumplidasSubject = new BehaviorSubject<Alerta[]>([]);
  alertasCumplidas$: Observable<Alerta[]> = this.alertasCumplidasSubject.asObservable();

  private notifiedAlertIds: Set<number> = new Set();

  constructor(
    private api: Api,
    private auth: AuthService,
    private notificacion: NotificacionService
  ) {
    this.loadNotifiedIds();
  }

  private loadNotifiedIds(): void {
    const saved = localStorage.getItem('notifiedAlertIds');
    if (saved) {
      this.notifiedAlertIds = new Set(JSON.parse(saved));
    }
  }

  private saveNotifiedIds(): void {
    localStorage.setItem('notifiedAlertIds', JSON.stringify([...this.notifiedAlertIds]));
  }

  private removeNotifiedId(id: number): void {
    if (this.notifiedAlertIds.has(id)) {
      this.notifiedAlertIds.delete(id);
      this.saveNotifiedIds();
    }
  }

  setAlertas(alertas: Alerta[]): void {
    this.alertasSubject.next(alertas);
  }

  evaluarAlertas(): void {
    const userId = this.auth.getCurrentUserId();
    if (!userId) return;

    this.api.evaluarAlertas(userId).subscribe({
      next: (alertas: Alerta[]) => {
        this.alertasSubject.next(alertas);

        const cumplidas = alertas.filter(
          (a) => !a.activa && (a.fechaCumplida || (a as any).fecha_cumplida)
        );
        this.alertasCumplidasSubject.next(cumplidas);

        cumplidas.forEach((alerta) => {
          if (!alerta.empresa) return;
          if (this.notifiedAlertIds.has(alerta.id)) return;

          this.notificacion.mostrar(
            `⚡ Alerta cumplida: ${alerta.empresa.nombre} (${alerta.empresa.ticker}) → condición ${alerta.condicion} ${alerta.valor}`
          );

          this.notifiedAlertIds.add(alerta.id);
          this.saveNotifiedIds();
        });
      },
      error: (err) => console.error('Error evaluando alertas', err),
    });
  }

  
  eliminarAlerta(id: number): void {
    const alertas = this.alertasSubject.getValue().filter(a => a.id !== id);
    this.alertasSubject.next(alertas);
    this.removeNotifiedId(id);
  }
}
