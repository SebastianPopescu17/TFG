import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Empresa } from '../../../core/models/empresa';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { PollingService } from '../../../core/services/polling.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-empresas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './empresas-list.component.html',
  styleUrls: ['./empresas-list.component.css']
})
export class EmpresasListComponent implements OnInit, OnDestroy {
  empresas: Empresa[] = [];
  dataSource = new MatTableDataSource<Empresa>([]);
  displayedColumns: string[] = ['ticker', 'nombre', 'sector', 'pais', 'precio_actual', 'acciones'];

  sectores: string[] = [];
  paises: string[] = [];

  selectedSector: string | null = null;
  selectedPais: string | null = null;

  private sub?: Subscription;

  constructor(private polling: PollingService, private router: Router) {}

  ngOnInit(): void {
    this.polling.startGlobal();
    this.sub = this.polling.empresas$.subscribe(empresas => {
      this.empresas = empresas;

      this.sectores = [...new Set(empresas.map(e => e.sector).filter((s): s is string => !!s))];
      this.paises   = [...new Set(empresas.map(e => e.pais).filter((p): p is string => !!p))];

      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    
    this.sub?.unsubscribe();
  }

  applyFilter(): void {
    this.dataSource.data = this.empresas.filter(e =>
      (!this.selectedSector || e.sector === this.selectedSector) &&
      (!this.selectedPais || e.pais === this.selectedPais)
    );
  }

  selectSector(sector: string | null): void {
    this.selectedSector = sector;
    this.applyFilter();
  }

  selectPais(pais: string | null): void {
    this.selectedPais = pais;
    this.applyFilter();
  }

  verDetalles(e: Empresa): void {
    this.router.navigate(['/empresas', e.ticker]);
  }
}
