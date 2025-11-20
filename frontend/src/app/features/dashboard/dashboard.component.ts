import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavCard } from '../../core/models/navcard';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  tagline: string = 'Tu centro de control financiero';
  description: string = 'Explora, analiza y gestiona tus inversiones con precisión y estilo.';

  navCards: NavCard[] = [
    {
      title: 'Empresas',
      description: 'Consulta datos clave de compañías, sectores y su desempeño en el mercado.',
      href: '/empresas',
      icon: 'business',
    },
    {
      title: 'Favoritos',
      description: 'Guarda tus acciones y empresas favoritas para seguirlas de cerca.',
      href: '/watchlist',
      icon: 'star',
    },
    {
      title: 'Calculadora',
      description: 'Proyecta tus inversiones y evalúa posibles escenarios financieros.',
      href: '/calculadora',
      icon: 'calculate',
    },
    {
      title: 'Alertas',
      description: 'Recibe notificaciones automáticas sobre precios, eventos o tendencias.',
      href: '/alertas',
      icon: 'notifications',
    },
    {
      title: 'Cartera',
      description: 'Visualiza tus posiciones, movimientos y rentabilidad en tiempo real.',
      href: '/cartera',
      icon: 'account_balance_wallet',
    },
    {
      title: 'Histórico',
      description: 'Visualiza tus posiciones pasadas de las empresas.',
      href: '/historico',
      icon: 'account_balance_wallet',
    },
    {
      title: 'Saldo',
      description: 'Consulta tu saldo disponible, ingresa fondos o realiza retiros.',
      href: '/saldo',
      icon: 'savings',
    },
    {
      title: 'Indicadores Macros',
      description: 'Accede a métricas macroeconómicas esenciales para tus decisiones de inversión.',
      href: '/macros',
      icon: 'bar_chart',
    },
  ];

  constructor(private auth: AuthService) {}

  get isAdmin(): boolean {
    return this.auth.getCurrentUser()?.role === 'admin';
  }
}
