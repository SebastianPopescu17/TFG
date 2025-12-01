import { Routes } from '@angular/router';
import { LayoutComponent } from './features/layout/layout/layout.component';
import { authGuard } from './core/guards/auth-guard.guard';
import { roleGuard } from './core/guards/role-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { path: 'recuperar-contrasena', loadComponent: () => import('./features/recuperar-contrasena/recuperar-contrasena.component').then(m => m.RecuperarContrasenaComponent) },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'empresas', loadComponent: () => import('./features/empresas/empresas-list/empresas-list.component').then(m => m.EmpresasListComponent) },
      { path: 'empresas/:ticker', loadComponent: () => import('./features/empresas/empresa-detail/empresa-detail.component').then(m => m.EmpresaDetailComponent) },
      { path: 'alertas', loadComponent: () => import('./features/alertas/alertas-list/alertas-list.component').then(m => m.AlertasListComponent) },
      { path: 'alertas/nueva', loadComponent: () => import('./features/alertas/alerta-form/alerta-form.component').then(m => m.AlertaFormComponent) },
      { path: 'watchlist', loadComponent: () => import('./features/watchlist/watchlist.component').then(m => m.WatchlistComponent) },
      { path: 'cartera', loadComponent: () => import('./features/cartera/cartera.component').then(m => m.CarteraComponent) },
      { path: 'cartera/operaciones', loadComponent: () => import('./features/operaciones/operaciones.component').then(m => m.OperacionesComponent) },
      { path: 'saldo', loadComponent: () => import('./features/saldo/saldo.component').then(m => m.SaldoComponent) },
      { path: 'historico', loadComponent: () => import('./features/precios-historicos/precios-historicos.component').then(m => m.PreciosHistoricosComponent) },
      { path: 'macros', loadComponent: () => import('./features/indicadores-macro/indicadores-macro.component').then(m => m.IndicadoresMacroComponent) },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      { path: 'calculadora', loadComponent: () => import('./features/calculadora/calculadora.component').then(m => m.CalculadoraComponent) }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
