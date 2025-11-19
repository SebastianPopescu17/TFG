import { Injectable } from '@angular/core';
import { interval, BehaviorSubject, Subject, of, forkJoin, Observable } from 'rxjs';
import { switchMap, takeUntil, catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { Empresa } from '../models/empresa';
import { Alerta } from '../models/alerta';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class PollingService {
  private empresasSubject = new BehaviorSubject<Empresa[]>([]);
  empresas$ = this.empresasSubject.asObservable();

  private empresaSubject = new BehaviorSubject<Empresa | null>(null);
  empresa$ = this.empresaSubject.asObservable();

  private alertasSubject = new BehaviorSubject<Alerta[]>([]);
  alertas$ = this.alertasSubject.asObservable();

  private stop$ = new Subject<void>();
  private tendencia: 'alcista' | 'bajista' | 'lateral' = 'lateral';

  constructor(
    private api: Api,
    private auth: AuthService,
    private notificacion: NotificacionService
  ) {
    interval(60000).subscribe(() => {
      const estados: Array<'alcista' | 'bajista' | 'lateral'> = ['alcista', 'bajista', 'lateral'];
      this.tendencia = estados[Math.floor(Math.random() * estados.length)];
    });
  }

  startGlobal(): void {
    this.stop();
    const userId = this.auth.getCurrentUserId();
    if (!userId) return;

    // 1. Cargar alertas primero
    this.api.getAlertas(userId).pipe(
      catchError(() => of([] as Alerta[])),
      tap(alertas => this.alertasSubject.next(alertas)),
      // 2. Una vez cargadas, iniciar el polling de precios y la evaluación
      switchMap(() =>
        interval(5000).pipe(
          takeUntil(this.stop$),
          switchMap((): Observable<Empresa[]> =>
            this.api.getEmpresas().pipe(
              map(res => res.data as Empresa[]),
              catchError(() => of([] as Empresa[]))
            )
          ),
          mergeMap((empresas: Empresa[]): Observable<Empresa[]> => this.actualizarEmpresas(empresas))
        )
      )
    ).subscribe((empresas: Empresa[]) => {
      this.empresasSubject.next(empresas);
      this.evaluarAlertas(empresas, this.alertasSubject.getValue());
    });

    this.startAlertas();
  }

  startForTicker(ticker: string): void {
    this.stop();

    interval(5000).pipe(
      takeUntil(this.stop$),
      switchMap((): Observable<Empresa> =>
        this.api.getEmpresa(ticker).pipe(
          map((empresa: Empresa) => empresa),
          catchError(() => of(null as unknown as Empresa))
        )
      ),
      mergeMap((empresa: Empresa): Observable<Empresa> => this.actualizarEmpresa(empresa))
    ).subscribe((empresa: Empresa) => {
      this.empresaSubject.next(empresa);
      this.evaluarAlertas([empresa], this.alertasSubject.getValue());
    });

    this.startAlertas();
  }

  private startAlertas(): void {
    const userId = this.auth.getCurrentUserId();
    if (!userId) return;

    interval(30000).pipe(
      takeUntil(this.stop$),
      switchMap((): Observable<Alerta[]> =>
        this.api.getAlertas(userId).pipe(
          catchError(() => of([] as Alerta[]))
        )
      )
    ).subscribe(alertas => this.alertasSubject.next(alertas));
  }

  stop(): void {
    this.stop$.next();
  }

  private evaluarAlertas(empresas: Empresa[], alertas: Alerta[]): void {
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

        this.api.updateAlerta(this.auth.getCurrentUserId()!, alerta.id, { activa: false }).subscribe();
      }
    });
  }

  private actualizarEmpresas(empresas: Empresa[]): Observable<Empresa[]> {
    const empresasConVariacion: Empresa[] = empresas.map(e => ({
      ...e,
      precio_actual: this.simularVariacion(e.precio_actual ?? 0)
    }));

    return forkJoin(
      empresasConVariacion.map(e =>
        this.api.updatePrecioEmpresa(e.id, e.precio_actual ?? 0).pipe(
          catchError(() => of(null))
        )
      )
    ).pipe(map(() => empresasConVariacion));
  }

  private actualizarEmpresa(empresa: Empresa): Observable<Empresa> {
    const nuevoPrecio = this.simularVariacion(empresa.precio_actual ?? 0);
    const empresaConVariacion: Empresa = { ...empresa, precio_actual: nuevoPrecio };

    return this.api.updatePrecioEmpresa(empresa.id, nuevoPrecio).pipe(
      catchError(() => of(null)),
      map(() => empresaConVariacion)
    );
  }

  private simularVariacion(precio: unknown): number {
    const base = Number(precio) || 0;
    const ruido = this.randomNormal(0, Math.random() * (0.015 - 0.003) + 0.003);
    let tendenciaFactor = 0;
    switch (this.tendencia) {
      case 'alcista': tendenciaFactor = 0.002; break;
      case 'bajista': tendenciaFactor = -0.002; break;
      case 'lateral': tendenciaFactor = 0; break;
    }
    const factor = 1 + tendenciaFactor + ruido;
    return +(base * factor).toFixed(2);
  }

  private randomNormal(mean = 0, stdDev = 0.01): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}
