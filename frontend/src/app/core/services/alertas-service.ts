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

  evaluarAlertas(empresas: Empresa[]): void {
    const alertas = this.alertasSubject.getValue();
    alertas.forEach(alerta => {
      if (!alerta.activa) return;

      const empresa = empresas.find(e => e.id === alerta.empresa_id);
      if (!empresa) return;

      const precio = empresa.precio_actual ?? 0;
      let cumple = false;

      switch (alerta.condicion) {
        case 'mayor': cumple = precio > alerta.valor; break;
        case 'menor': cumple = precio < alerta.valor; break;
        case 'igual': cumple = Math.abs(precio - alerta.valor) < 0.01; break;
      }

      if (cumple) {
        this.notificacion.mostrar(
          `⚡ Alerta cumplida: ${empresa.nombre} (${empresa.ticker}) precio ${alerta.condicion} ${alerta.valor}`
        );

        alerta.activa = false;
        this.alertasSubject.next([...alertas]);
        this.alertasCumplidasSubject.next([...this.alertasCumplidasSubject.getValue(), alerta]);

        this.api.updateAlerta(this.auth.getCurrentUserId()!, alerta.id, { activa: false }).subscribe();
      }
    });
  }
}
