import { Injectable } from '@angular/core';
import { interval, BehaviorSubject, Subject, of, forkJoin, Observable } from 'rxjs';
import { switchMap, takeUntil, catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { Empresa } from '../models/empresa';
import { Alerta } from '../models/alerta';
import { AlertasService } from './alertas-service';

@Injectable({ providedIn: 'root' })
export class PollingService {
  private empresasSubject = new BehaviorSubject<Empresa[]>([]);
  empresas$ = this.empresasSubject.asObservable();

  private empresaSubject = new BehaviorSubject<Empresa | null>(null);
  empresa$ = this.empresaSubject.asObservable();

  private stop$ = new Subject<void>();
  private tendencia: 'alcista' | 'bajista' | 'lateral' = 'lateral';

  constructor(
    private api: Api,
    private auth: AuthService,
    private alertasService: AlertasService
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

    this.api.getAlertas(userId).pipe(
      catchError(() => of([] as Alerta[])),
      tap(alertas => this.alertasService.setAlertas(alertas)),
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
      this.alertasService.evaluarAlertas(empresas);
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
      this.alertasService.evaluarAlertas([empresa]);
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
    ).subscribe(alertas => this.alertasService.setAlertas(alertas));
  }

  stop(): void {
    this.stop$.next();
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
