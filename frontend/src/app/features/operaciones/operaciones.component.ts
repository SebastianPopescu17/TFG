import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { Api } from '../../core/services/api.service';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { GenerarPdfComponent } from './generar-pdf/generar-pdf.component';

@Component({
  selector: 'app-operaciones',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule,MatProgressSpinnerModule, GenerarPdfComponent],
  templateUrl: './operaciones.component.html',
  styleUrls: ['./operaciones.component.css']
})
export class OperacionesComponent implements OnInit {
  operaciones: any[] = [];
  total = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = true;
  displayedColumns = ['fecha', 'empresa', 'ticker', 'tipo', 'cantidad', 'precio', 'importe', 'plusvalia'];

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.cargarOperaciones();
  }

  cargarOperaciones(page: number = 1): void {
    this.loading = true;
    this.api.getOperaciones(page).subscribe({
      next: (res: any) => {
        this.operaciones = res.data ?? [];
        this.total = res.total;
        this.pageSize = res.per_page;
        this.pageIndex = res.current_page - 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.cargarOperaciones(event.pageIndex + 1);
  }
}
