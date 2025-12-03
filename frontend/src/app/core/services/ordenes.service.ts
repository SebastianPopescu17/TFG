import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Api } from './api.service';
import { NotificacionService } from './notificacion.service';
import { Orden } from '../models/orden';
import { Empresa } from '../models/empresa';

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private ordenesSubject = new BehaviorSubject<Orden[]>([]);
  ordenes$ = this.ordenesSubject.asObservable();

  private ordenesCumplidasSubject = new BehaviorSubject<Orden[]>([]);
  ordenesCumplidas$ = this.ordenesCumplidasSubject.asObservable();

  private notifiedOrderIds: Set<number> = new Set();

  constructor(private api: Api, private notificacion: NotificacionService) {
    this.loadNotifiedIds(); 
  }

  private loadNotifiedIds(): void {
    const saved = localStorage.getItem('notifiedOrderIds');
    if (saved) {
      this.notifiedOrderIds = new Set(JSON.parse(saved));
    }
  }

  private saveNotifiedIds(): void {
    localStorage.setItem('notifiedOrderIds', JSON.stringify([...this.notifiedOrderIds]));
  }

  setOrdenes(ordenes: Orden[]): void {
    this.ordenesSubject.next(ordenes);
  }

  evaluarOrdenes(empresas: Empresa[]): void {
    this.api.getOrdenes().subscribe({
      next: (res) => {
        const ordenes = (res.data ?? res) as Orden[];

        const ordenesActualizadas = ordenes.map((o) => ({
          ...o,
          precio_actual: empresas.find((e) => e.id === o.empresa_id)?.precio_actual ?? null,
        }));

        this.ordenesSubject.next(ordenesActualizadas);

        const cumplidas = ordenesActualizadas.filter((o) => o.estado === 'cumplida');
        this.ordenesCumplidasSubject.next(cumplidas);

        cumplidas.forEach((orden) => {
          if (this.notifiedOrderIds.has(orden.id)) {
            return;
          }

          if (!orden.empresa) return;

          this.notificacion.mostrar(
            `✅ Orden cumplida: ${orden.tipo} de ${orden.empresa.nombre} (${orden.empresa.ticker}) por ${orden.cantidad}`
          );

          this.notifiedOrderIds.add(orden.id);
          this.saveNotifiedIds();
        });
      },
      error: (err) => console.error('Error evaluando órdenes', err),
    });
  }

  actualizarOrden(ordenActualizada: Orden): void {
    const ordenes = this.ordenesSubject.getValue();
    const nuevasOrdenes = ordenes.map(o =>
      o.id === ordenActualizada.id ? ordenActualizada : o
    );
    this.ordenesSubject.next(nuevasOrdenes);
  }
}
