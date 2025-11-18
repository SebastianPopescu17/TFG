
import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Row, PercentileRow, SimpleSimulationResult, MonteCarloSimulationResult } from './calculadora.service';

@Injectable({
  providedIn: 'root',
})
export class ChartService {


  getLineChartData(rows: Row[]): ChartConfiguration<'line'>['data'] {
    const labels = rows.map((r) => r.year.toString());
    return {
      labels,
      datasets: [
        {
          data: rows.map((r) => r.valorNominal),
          label: 'Valor Nominal',
          borderColor: '#4caf50',
          tension: 0.2,
          fill: false,
        },
        {
          data: rows.map((r) => r.valorReal),
          label: 'Valor Real (ajustado a inflación)',
          borderColor: '#ff9800',
          tension: 0.2,
          fill: false,
        },
        {
          data: rows.map((r) => r.aportado),
          label: 'Total Aportado',
          borderColor: '#2196f3',
          tension: 0.2,
          fill: false,
        },
      ],
    };
  }


  getBarChartData(rows: Row[]): ChartConfiguration<'bar'>['data'] {
    const labels = rows.map((r) => r.year.toString());
    return {
      labels,
      datasets: [
        {
          data: rows.map((r) => r.aportado),
          label: 'Aportado',
          backgroundColor: '#2196f3',
        },
        {
          data: rows.map((r) => r.intereses),
          label: 'Intereses',
          backgroundColor: '#4caf50',
        },
      ],
    };
  }


  getMonteCarloLineChartData(result: MonteCarloSimulationResult): ChartConfiguration<'line'>['data'] {
    const { percentileRows } = result;
    const labels = percentileRows.map((r) => r.year.toString());

    return {
      labels,
      datasets: [

        {
          data: percentileRows.map(r => r.p90),
          label: 'Percentil 90',
          borderColor: 'rgba(75, 192, 192, 0.2)',
          pointRadius: 0,
          tension: 0.4,
          fill: '+1',
        },
        {
          data: percentileRows.map(r => r.p10),
          label: 'Rango de probabilidad (80%)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 0.2)',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },

        {
          data: percentileRows.map(r => r.p75),
          label: 'Percentil 75',
          borderColor: 'rgba(75, 192, 192, 0.4)',
          pointRadius: 0,
          tension: 0.4,
          fill: '+1',
        },
        {
          data: percentileRows.map(r => r.p25),
          label: 'Rango de probabilidad (50%)',
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 0.4)',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },

        {
          data: percentileRows.map(r => r.p50),
          label: 'Mediana (Resultado más probable)',
          borderColor: '#4caf50',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
      ],
    };
  }
}
