import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { Empresa } from '../models/empresa';
import { AlertasService } from './alertas-service';
import { OrdenesService } from './ordenes.service';

@Injectable({ providedIn: 'root' })
export class PollingService {
  private empresasSubject = new BehaviorSubject<Empresa[]>([]);
  empresas$ = this.empresasSubject.asObservable();

  private empresaSubject = new BehaviorSubject<Empresa | null>(null);
  empresa$ = this.empresaSubject.asObservable();

  private globalSubscription: Subscription | null = null;
  private tickerSubscription: Subscription | null = null;
  private stop$ = new Subject<void>();

  constructor(
    private api: Api,
    private auth: AuthService,
    private alertasService: AlertasService,
    private ordenesService: OrdenesService
  ) {}

  startGlobal(): void {
    if (!this.auth.isAuthenticated()) return;
    if (this.globalSubscription && !this.globalSubscription.closed) return;

    this.refreshGlobalData();

    this.globalSubscription = interval(5000)
      .pipe(takeUntil(this.stop$))
      .subscribe(() => {
        this.refreshGlobalData();
        if (new Date().getSeconds() % 30 < 5) {
          this.alertasService.evaluarAlertas();
        }
      });
  }

  private refreshGlobalData() {
    this.api.getEmpresas().subscribe({
      next: res => {
        this.empresasSubject.next(res.data);
        this.ordenesService.evaluarOrdenes(res.data);
      },
      error: () => {}
    });
  }

  startForTicker(ticker: string): void {
    if (!this.auth.isAuthenticated()) return;
    this.stopTicker();
    this.fetchTicker(ticker);

    this.tickerSubscription = interval(5000)
      .pipe(takeUntil(this.stop$))
      .subscribe(() => {
        this.fetchTicker(ticker);
      });
  }

  private fetchTicker(ticker: string) {
    this.api.getEmpresa(ticker).subscribe({
      next: empresa => this.empresaSubject.next(empresa),
      error: () => {}
    });
  }

  stopTicker(): void {
    if (this.tickerSubscription) {
      this.tickerSubscription.unsubscribe();
      this.tickerSubscription = null;
    }
  }

  stopAll(): void {
    this.stop$.next();
    if (this.globalSubscription) this.globalSubscription.unsubscribe();
    if (this.tickerSubscription) this.tickerSubscription.unsubscribe();
    this.globalSubscription = null;
    this.tickerSubscription = null;
  }
}
