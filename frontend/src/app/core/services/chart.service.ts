import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Row, MonteCarloSimulationResult } from './calculadora.service';

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
          borderColor: '#1E3A8A',
          backgroundColor: '#1E3A8A20',
          tension: 0.2,
          fill: false,
        },
        {
          data: rows.map((r) => r.valorReal),
          label: 'Valor Real (ajustado a inflación)',
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F620',
          tension: 0.2,
          fill: false,
        },
        {
          data: rows.map((r) => r.aportado),
          label: 'Total Aportado',
          borderColor: '#10B981',
          backgroundColor: '#10B98120',
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
          backgroundColor: '#2563EB',
        },
        {
          data: rows.map((r) => r.intereses),
          label: 'Intereses',
          backgroundColor: '#F59E0B',
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
          borderColor: '#EF4444',
          backgroundColor: '#EF444420',
          pointRadius: 0,
          tension: 0.4,
          fill: '+1',
        },
        {
          data: percentileRows.map(r => r.p10),
          label: 'Rango de probabilidad (80%)',
          borderColor: '#6B7280',
          backgroundColor: '#6B728020',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          data: percentileRows.map(r => r.p75),
          label: 'Percentil 75',
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F620',
          pointRadius: 0,
          tension: 0.4,
          fill: '+1',
        },
        {
          data: percentileRows.map(r => r.p25),
          label: 'Rango de probabilidad (50%)',
          borderColor: '#9333EA',
          backgroundColor: '#9333EA20',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          data: percentileRows.map(r => r.p50),
          label: 'Mediana (Resultado más probable)',
          borderColor: '#10B981',
          backgroundColor: '#10B98120',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
      ],
    };
  }

  getMonteCarloBarChartData(result: MonteCarloSimulationResult): ChartConfiguration<'bar'>['data'] {
    const { percentileRows } = result;
    const labels = percentileRows.map((r) => r.year.toString());

    return {
      labels,
      datasets: [
        {
          data: percentileRows.map(r => r.p10),
          label: 'P10',
          backgroundColor: '#1e90ff',
        },
        {
          data: percentileRows.map(r => r.p25),
          label: 'P25',
          backgroundColor: '#F59E0B',
        },
        {
          data: percentileRows.map(r => r.p50),
          label: 'P50 (Mediana)',
          backgroundColor: '#10B981',
        },
        {
          data: percentileRows.map(r => r.p75),
          label: 'P75',
          backgroundColor: '#3B82F6',
        },
        {
          data: percentileRows.map(r => r.p90),
          label: 'P90',
          backgroundColor: '#9333EA',
        },
      ],
    };
  }
}
