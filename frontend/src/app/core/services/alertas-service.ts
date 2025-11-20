import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alerta } from '../models/alerta';
import { Empresa } from '../models/empresa';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private alertasSubject = new BehaviorSubject<Alerta[]>([]);
  alertas$ = this.alertasSubject.asObservable();

  private alertasCumplidasSubject = new BehaviorSubject<Alerta[]>([]);
  alertasCumplidas$ = this.alertasCumplidasSubject.asObservable();

  constructor(
    private api: Api,
    private auth: AuthService,
    private notificacion: NotificacionService
  ) {}

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
          this.notificacion.mostrar(
            `⚡ Alerta cumplida: ${alerta.empresa.nombre} (${alerta.empresa.ticker}) → condición ${alerta.condicion} ${alerta.valor}`
          );
        });
      },
      error: (err) => console.error('Error evaluando alertas', err),
    });
  }

  private cumpleCondicion(alerta: Alerta, precio: number): boolean {
    const valor = alerta.valor;

    switch (alerta.condicion) {
      case 'mayor':
        return typeof valor === 'number' ? precio > valor : false;

      case 'menor':
        return typeof valor === 'number' ? precio < valor : false;

      case 'igual':
        return typeof valor === 'number' ? Math.abs(precio - valor) < 0.01 : false;

      case 'entre':
        return Array.isArray(valor) ? precio >= valor[0] && precio <= valor[1] : false;

      default:
        return false;
    }
  }
}
