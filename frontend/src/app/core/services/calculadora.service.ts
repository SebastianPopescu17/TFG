
import { Injectable } from '@angular/core';


export type Row = {
  year: number;
  aportado: number;
  intereses: number;
  valorNominal: number;
  valorReal: number;
};


export type PercentileRow = {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};


export type SimpleSimulationResult = {
  type: 'simple';
  totalNominal: number;
  totalReal: number;
  objetivoAlcanzado?: number;
  moneyRunsOutYear?: number;
  rows: Row[];
};


export type MonteCarloSimulationResult = {
  type: 'monte_carlo';
  percentileRows: PercentileRow[];

};

@Injectable({
  providedIn: 'root',
})
export class CalculadoraService {


  calcular(formValue: any): SimpleSimulationResult | MonteCarloSimulationResult {
    if (formValue.isMonteCarlo) {
      return this.runMonteCarloSimulation(formValue);
    }
    return this.runSingleSimulation(formValue);
  }


  private runMonteCarloSimulation(formValue: any): MonteCarloSimulationResult {
    const { simulationCount, years, standardDeviation, interestRate } = formValue;
    const rMean = (Number(interestRate ?? 0) + Number(formValue.dividendRate ?? 0)) / 100;
    const sigma = Number(standardDeviation) / 100;


    const allSimulations: number[][] = [];

    for (let i = 0; i < simulationCount; i++) {
      const simulationResult = this.runSingleSimulation({ ...formValue, isMonteCarlo: false }, rMean, sigma);
      const yearValues = simulationResult.rows.map(row => row.valorNominal);
      allSimulations.push(yearValues);
    }


    const percentileRows: PercentileRow[] = [];
    for (let yearIndex = 0; yearIndex < years; yearIndex++) {
      const valuesForYear = allSimulations.map(sim => sim[yearIndex] || 0);
      valuesForYear.sort((a, b) => a - b);

      percentileRows.push({
        year: yearIndex + 1,
        p10: valuesForYear[Math.floor(simulationCount * 0.1)],
        p25: valuesForYear[Math.floor(simulationCount * 0.25)],
        p50: valuesForYear[Math.floor(simulationCount * 0.5)],
        p75: valuesForYear[Math.floor(simulationCount * 0.75)],
        p90: valuesForYear[Math.floor(simulationCount * 0.9)],
      });
    }

    return {
      type: 'monte_carlo',
      percentileRows,
    };
  }


  private runSingleSimulation(formValue: any, rMean?: number, sigma?: number): SimpleSimulationResult {
    const {
      initialInvestment, monthlyContribution, years, interestRate, inflationRate, annualFee,
      dividendRate, growthRate, taxRate, objetivo, rentabilidadesAnuales, marketCrashEvents,
      extraContributions, retirementStartYear, annualWithdrawal, withdrawalGrowthRate
    } = formValue;

    const P = Number(initialInvestment ?? 0);
    const C = Number(monthlyContribution ?? 0);
    const rBase = (rMean === undefined) ? ((Number(interestRate ?? 0) + Number(dividendRate ?? 0)) / 100) : rMean;
    const inflAnual = Number(inflationRate ?? 0) / 100;
    const feeAnual = Number(annualFee ?? 0) / 100;
    const growth = Number(growthRate ?? 0) / 100;
    const tax = Number(taxRate ?? 0) / 100;
    const withdrawalGrowth = Number(withdrawalGrowthRate ?? 0) / 100;

    const rows: Row[] = [];
    let objetivoAlcanzado: number | undefined;
    let moneyRunsOutYear: number | undefined;
    let valorAcumulado = P;
    let totalAportado = P;

    for (let year = 1; year <= years; year++) {

      if (year < retirementStartYear) {
        const aportacionAnual = C * 12 * Math.pow(1 + growth, year - 1);
        const extras = extraContributions.filter((e: any) => e.year === year).reduce((sum: number, e: any) => sum + e.amount, 0);
        totalAportado += aportacionAnual + extras;
        valorAcumulado += aportacionAnual + extras;
      } else {
        const retiroAnual = annualWithdrawal * Math.pow(1 + withdrawalGrowth, year - retirementStartYear);
        valorAcumulado -= retiroAnual;
      }

      if (valorAcumulado < 0) { valorAcumulado = 0; if (!moneyRunsOutYear) moneyRunsOutYear = year; }


      let rAnual = rBase;
      if (sigma !== undefined) {
        rAnual = this.getNormalRandom(rBase, sigma);
      }
      if (rentabilidadesAnuales && rentabilidadesAnuales.length >= year) {
        rAnual = rentabilidadesAnuales[year - 1] / 100;
      }
      const crash = marketCrashEvents.find((e: any) => e.year === year);
      if (crash) rAnual -= Number(crash.percentage) / 100;

      const ganancias = valorAcumulado * rAnual;
      const comision = (valorAcumulado + ganancias) * feeAnual;
      const impuestos = (ganancias - comision > 0) ? (ganancias - comision) * tax : 0;
      valorAcumulado += ganancias - comision - impuestos;

      if (valorAcumulado < 0) { valorAcumulado = 0; if (!moneyRunsOutYear) moneyRunsOutYear = year; }

      const valorReal = valorAcumulado / Math.pow(1 + inflAnual, year);
      rows.push({
        year, aportado: round2(totalAportado), intereses: round2(valorAcumulado - totalAportado),
        valorNominal: round2(valorAcumulado), valorReal: round2(valorReal)
      });

      if (!objetivoAlcanzado && valorAcumulado >= objetivo) objetivoAlcanzado = year;
      if (moneyRunsOutYear && year >= moneyRunsOutYear) {

        rows[rows.length-1].valorNominal = 0;
        rows[rows.length-1].valorReal = 0;
        rows[rows.length-1].intereses = rows[rows.length-2]?.intereses || 0;
      }
    }

    return {
      type: 'simple', totalNominal: rows.at(-1)?.valorNominal ?? 0, totalReal: rows.at(-1)?.valorReal ?? 0,
      objetivoAlcanzado, moneyRunsOutYear, rows
    };
  }


  private getNormalRandom(mean: number, stdev: number): number {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return z * stdev + mean;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
