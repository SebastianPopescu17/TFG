import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay, Subject, takeUntil, interval } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PollingService } from '../../../core/services/polling.service';
import { AlertasService } from '../../../core/services/alertas-service';
import { Alerta } from '../../../core/models/alerta';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean>;
  showLayout = true;
  sidebarCollapsed = false;

  alertasActivas: Alerta[] = [];
  alertasCumplidas: Alerta[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private polling: PollingService,
    private alertasService: AlertasService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches), shareReplay());

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          const hiddenRoutes = ['/login', '/register', '/recuperar-contrasena'];
          this.showLayout = !hiddenRoutes.includes(event.urlAfterRedirects);
        }
      });
  }

  ngOnInit(): void {
  this.auth.currentUser$.subscribe(user => {
    if (user) {
      this.polling.startGlobal();
    }
  });

  this.alertasService.alertas$.subscribe(a => this.alertasActivas = a);
  this.alertasService.alertasCumplidas$.subscribe(a => this.alertasCumplidas = a);

  interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
    this.alertasService.evaluarAlertas();
  });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get user() {
    return this.auth.getCurrentUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
