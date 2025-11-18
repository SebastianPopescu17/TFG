import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PollingService } from '../../../core/services/polling.service';

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
export class LayoutComponent implements OnInit {
  isHandset$: Observable<boolean>;
  showLayout = true;
  sidebarCollapsed = false;
  currentRouteClass = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private polling: PollingService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches), shareReplay());

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/login', '/register', '/recuperar-contrasena'];
        this.showLayout = !hiddenRoutes.includes(event.urlAfterRedirects);

        if (event.urlAfterRedirects.includes('dashboard')) this.currentRouteClass = 'bg-dashboard';
        else if (event.urlAfterRedirects.includes('empresas')) this.currentRouteClass = 'bg-empresas';
        else if (event.urlAfterRedirects.includes('watchlist')) this.currentRouteClass = 'bg-watchlist';
        else if (event.urlAfterRedirects.includes('alertas')) this.currentRouteClass = 'bg-alertas';
        else if (event.urlAfterRedirects.includes('noticias')) this.currentRouteClass = 'bg-noticias';
        else if (event.urlAfterRedirects.includes('calculadora')) this.currentRouteClass = 'bg-calculadora';
        else if (event.urlAfterRedirects.includes('admin')) this.currentRouteClass = 'bg-admin';
        else this.currentRouteClass = '';
      }
    });
  }

  ngOnInit(): void {
    // Arranca el polling global de alertas
    this.polling.startGlobal();
  }

  get user() {
    return this.auth.getCurrentUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
