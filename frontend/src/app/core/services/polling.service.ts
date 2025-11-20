import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { Empresa } from '../models/empresa';
import { AlertasService } from './alertas-service';

@Injectable({ providedIn: 'root' })
export class PollingService implements OnDestroy {
  private empresasSubject = new BehaviorSubject<Empresa[]>([]);
  empresas$ = this.empresasSubject.asObservable();

  private empresaSubject = new BehaviorSubject<Empresa | null>(null);
  empresa$ = this.empresaSubject.asObservable();

  private stop$ = new Subject<void>();

  constructor(
    private api: Api,
    private auth: AuthService,
    private alertasService: AlertasService
  ) {}

  startGlobal(): void {
    this.stop();

    if (!this.auth.isAuthenticated()) return;

    const userId = this.auth.getCurrentUserId();
    if (!userId) return;

    this.api.getEmpresas().subscribe({
      next: empresas => this.empresasSubject.next(empresas),
      error: err => console.error('Error inicial cargando empresas', err)
    });

    interval(5000).pipe(takeUntil(this.stop$)).subscribe(() => {
      this.api.getEmpresas().subscribe({
        next: empresas => this.empresasSubject.next(empresas),
        error: err => console.error('Error cargando empresas', err)
      });
    });

    // Evaluar alertas cada 30s (refrescado + notificación)
    interval(30000).pipe(takeUntil(this.stop$)).subscribe(() => {
      this.alertasService.evaluarAlertas();
    });
  }

  startForTicker(ticker: string): void {
    this.stop();

    if (!this.auth.isAuthenticated()) return;

    // Refrescar empresa concreta cada 5s
    interval(5000).pipe(takeUntil(this.stop$)).subscribe(() => {
      this.api.getEmpresa(ticker).subscribe({
        next: empresa => this.empresaSubject.next(empresa),
        error: err => console.error('Error cargando empresa', err)
      });
    });

    // Evaluar alertas cada 30s también en vista de empresa
    interval(30000).pipe(takeUntil(this.stop$)).subscribe(() => {
      this.alertasService.evaluarAlertas();
    });
  }

  stop(): void {
    this.stop$.next();
  }

  ngOnDestroy(): void {
    this.stop();
    this.stop$.complete();
  }
}
