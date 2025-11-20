import { Routes } from '@angular/router';
import { LayoutComponent } from './features/layout/layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmpresasListComponent } from './features/empresas/empresas-list/empresas-list.component';
import { EmpresaDetailComponent } from './features/empresas/empresa-detail/empresa-detail.component';
import { AlertasListComponent } from './features/alertas/alertas-list/alertas-list.component';
import { AlertaFormComponent } from './features/alertas/alerta-form/alerta-form.component';
import { WatchlistComponent } from './features/watchlist/watchlist/watchlist.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { CalculadoraComponent } from './features/calculadora/calculadora.component';
import { RecuperarContrasenaComponent } from './features/recuperar-contrasena/recuperar-contrasena.component';
import { CarteraComponent } from './features/cartera/cartera.component';
import { OperacionesComponent } from './features/operaciones/operaciones.component';
import { SaldoComponent } from './features/saldo/saldo.component';
import { IndicadoresMacroComponent } from './features/indicadores-macro/indicadores-macro.component';

import { authGuard } from './core/guards/auth-guard.guard';
import { roleGuard } from './core/guards/role-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recuperar-contrasena', component: RecuperarContrasenaComponent },


  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'empresas', component: EmpresasListComponent },
      { path: 'empresas/:ticker', component: EmpresaDetailComponent },
      { path: 'alertas', component: AlertasListComponent },
      { path: 'alertas/nueva', component: AlertaFormComponent },
      { path: 'watchlist', component: WatchlistComponent },
      { path: 'cartera', component: CarteraComponent },
      { path: 'cartera/operaciones', component: OperacionesComponent },
      { path: 'saldo', component: SaldoComponent },
      { path: 'macros', component: IndicadoresMacroComponent },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' }
      },
      { path: 'calculadora', component: CalculadoraComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
