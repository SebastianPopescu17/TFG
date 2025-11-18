import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicadoresMacroService } from '../../core/services/indicadores-macro.service';
import { IndicadorMacro } from '../../core/models/indicadores';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-indicadores-macro',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule],
  templateUrl: './indicadores-macro.component.html',
  styleUrls: ['./indicadores-macro.component.css'],
})
export class IndicadoresMacroComponent implements OnInit {
  paises: string[] = [];
  indicadoresDisponibles: { codigo: string; nombre: string }[] = [];

  paisSeleccionado: string = '';
  indicadorSeleccionado: string = '';
  nombreIndicadorSeleccionado: string = '';

  registros: IndicadorMacro[] = [];

  aniosDisponibles: number[] = [];
  anioSeleccionado: number = new Date().getFullYear();
  valorPrincipalSeleccionado: number | null = null;

  sortColumn: 'anio' | 'valor' | 'variacion' = 'anio';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private indicadoresService: IndicadoresMacroService) {}

  ngOnInit() {
    this.indicadoresService.getPaises().subscribe((data) => {
      this.paises = data ?? [];
      if (this.paises.length > 0) {
        this.paisSeleccionado = this.paises[0];
      }
    });

    this.indicadoresService.getIndicadoresDisponibles().subscribe((data) => {
      this.indicadoresDisponibles = data ?? [];
      if (this.indicadoresDisponibles.length > 0) {
        this.indicadorSeleccionado = this.indicadoresDisponibles[0].codigo;
        this.nombreIndicadorSeleccionado = this.indicadoresDisponibles[0].nombre;
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    if (!this.paisSeleccionado || !this.indicadorSeleccionado) return;

    const indicador = this.indicadoresDisponibles.find(ind => ind.codigo === this.indicadorSeleccionado);
    this.nombreIndicadorSeleccionado = indicador ? indicador.nombre : '';

    this.indicadoresService.getIndicadores({
      pais: this.paisSeleccionado,
      desde: 2000,
    }).subscribe((data) => {
      this.registros = (data ?? []).filter(i => i.codigo === this.indicadorSeleccionado);
      this.registros.sort((a, b) => a.anio - b.anio);

      this.aniosDisponibles = this.registros.map(r => r.anio);
      if (!this.aniosDisponibles.includes(this.anioSeleccionado) && this.aniosDisponibles.length > 0) {
        this.anioSeleccionado = this.aniosDisponibles[this.aniosDisponibles.length - 1];
      }

      const registro = this.registros.find(r => r.anio === this.anioSeleccionado);
      this.valorPrincipalSeleccionado = registro ? registro.valor ?? null : null;

      for (let j = 1; j < this.registros.length; j++) {
        const prev = this.registros[j - 1];
        const curr = this.registros[j];
        if (prev.valor && curr.valor) {
          curr.variacion = +(((curr.valor - prev.valor) / prev.valor) * 100).toFixed(2);
        }
      }
    });
  }

  ordenarPor(col: 'anio' | 'valor' | 'variacion') {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }

    this.registros.sort((a, b) => {
      const valA = a[col] ?? 0;
      const valB = b[col] ?? 0;
      return this.sortDirection === 'asc'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }
}
