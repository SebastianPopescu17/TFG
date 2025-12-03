import { Component, OnInit, OnDestroy } from '@angular/core';
import { Api } from '../../core/services/api.service';
import { Empresa } from '../../core/models/empresa';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { PollingService } from '../../core/services/polling.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarDialogComponent } from '../confirmar-dialog/confirmar-dialog.component';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit, OnDestroy {
  userId: number | null = null;
  watchlist: Empresa[] = [];
  displayedColumns: string[] = ['ticker', 'nombre', 'sector', 'precio', 'acciones'];
  loading = true;

  private sub?: Subscription;

  constructor(
    private api: Api,
    private auth: AuthService,
    private router: Router,
    private polling: PollingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getCurrentUserId();
    if (this.userId) {
      this.cargarWatchlist();
    } else {
      this.loading = false;
    }

    this.polling.startGlobal();
    this.sub = this.polling.empresas$.subscribe(empresas => {
      this.watchlist = this.watchlist.map(w =>
        empresas.find(e => e.ticker === w.ticker) ?? w
      );
    });
  }

  ngOnDestroy(): void {
    
    this.sub?.unsubscribe();
  }

  cargarWatchlist(): void {
    if (!this.userId) return;
    this.loading = true;
    this.api.getWatchlist().subscribe({
      next: (empresas: Empresa[]) => {
        this.watchlist = empresas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando watchlist', err);
        this.loading = false;
      }
    });
  }

  eliminarDeWatchlist(empresa: Empresa): void {
    if (!this.userId || !empresa.id) return;

    this.dialog.open(ConfirmarDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Seguro que quieres eliminar ${empresa.nombre} de tu lista de favoritos?`
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.api.removeFromWatchlist(empresa.id).subscribe({
          next: () => {
            this.watchlist = this.watchlist.filter(e => e.id !== empresa.id);
          },
          error: (err) => console.error('Error eliminando de watchlist', err)
        });
      }
    });
  }

  irADetalle(ticker: string): void {

    this.router.navigate(['/empresas', ticker]);
  }
}
