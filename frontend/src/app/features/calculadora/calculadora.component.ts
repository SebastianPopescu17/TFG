import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CurrencyEsPipe } from '../../core/pipes/currency-es-pipe';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogoAyudaComponent } from './dialogo-ayuda/dialogo-ayuda.component';

type Row = {
  year: number;
  aportado: number;
  intereses: number;
  valorNominal: number;
  valorReal: number;
};

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
    CurrencyEsPipe,
    MatTabsModule,
    MatDialogModule
  ],
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css'],
})
export class CalculadoraComponent {
  form: FormGroup;

  result: {
    totalNominal: number;
    totalReal: number;
    objetivoAlcanzado?: number;
    rows: Row[];
  } | null = null;

  chartDataLine: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptionsLine: ChartConfiguration<'line'>['options'] = { responsive: true };

  chartDataBar: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptionsBar: ChartConfiguration<'bar'>['options'] = { responsive: true };

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group(
      {
        initialInvestment: [10000, [Validators.required, Validators.min(0)]],
        monthlyContribution: [500, [Validators.required, Validators.min(0)]],
        years: [10, [Validators.required, Validators.min(1), Validators.max(60)]],
        interestRate: [7, [Validators.required, Validators.min(0), Validators.max(100)]],
        inflationRate: [2, [Validators.min(0), Validators.max(100)]],
        annualFee: [1, [Validators.min(0), Validators.max(5)]],
        dividendRate: [2, [Validators.min(0), Validators.max(20)]],
        contributionFrequencyMonths: [1, [Validators.required]],
        growthRate: [2], // aportaciones crecientes %
        taxRate: [19], // impuestos sobre beneficios %
        objetivo: [100000], // objetivo de capital
        rentabilidadesAnuales: [[], [CalculadoraComponent.rentabilidadesValidator]],
        caidaMercado: [5], // año en el que cae el mercado
        caidaPorcentaje: [20], // % de caída
        extraContributions: this.fb.array([]),
      },
      { validators: CalculadoraComponent.objetivoValidator }
    );
  }
  openHelp() {
    this.dialog.open(DialogoAyudaComponent, {
      width: '700px',
      maxHeight: '90vh',
    });
  }
  get extraContributions(): FormArray {
    return this.form.get('extraContributions') as FormArray;
  }

  static objetivoValidator(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof FormGroup)) return null;

    const objetivo = Number(control.get('objetivo')?.value ?? 0);
    const years = Number(control.get('years')?.value ?? 0);
    const initial = Number(control.get('initialInvestment')?.value ?? 0);
    const monthly = Number(control.get('monthlyContribution')?.value ?? 0);
    const rate = Number(control.get('interestRate')?.value ?? 0) / 100;

    if (!objetivo || objetivo <= 0) return null;

    // cálculo rápido aproximado: inversión inicial + aportaciones + interés compuesto simple
    let estimado = initial;
    for (let y = 1; y <= years; y++) {
      estimado = (estimado + monthly * 12) * (1 + rate);
    }

    return estimado < objetivo ? { objetivoInalcanzable: true } : null;
  }

  static rentabilidadesValidator(control: AbstractControl): ValidationErrors | null {
    const values: number[] = control.value;
    if (!Array.isArray(values)) return null;

    const invalid = values.some((v) => v < -100 || v > 100);
    return invalid ? { rentabilidadFueraDeRango: true } : null;
  }

  static extraContributionValidator(maxYears: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormGroup)) return null;

      const year = control.get('year')?.value;
      const amount = control.get('amount')?.value;

      if (year <= 0 || year > maxYears) {
        return { yearInvalido: true };
      }

      if (amount <= 0) {
        return { montoInvalido: true };
      }

      return null;
    };
  }
  addExtraContribution() {
    const maxYears = this.form.get('years')?.value || 60;
    this.extraContributions.push(
      this.fb.group(
        {
          year: [1, [Validators.required]],
          amount: [1000, [Validators.required]],
        },
        { validators: CalculadoraComponent.extraContributionValidator(maxYears) }
      )
    );
  }

  onRentabilidadesBlur(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value || '';
    const rentabilidades = value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v));

    this.form.patchValue({ rentabilidadesAnuales: rentabilidades });
  }

  removeExtraContribution(index: number) {
    this.extraContributions.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const {
      initialInvestment,
      monthlyContribution,
      years,
      interestRate,
      inflationRate,
      annualFee,
      dividendRate,
      contributionFrequencyMonths,
      growthRate,
      taxRate,
      objetivo,
      rentabilidadesAnuales,
      caidaMercado,
      caidaPorcentaje,
    } = this.form.value;

    const P = Number(initialInvestment ?? 0);
    const C = Number(monthlyContribution ?? 0);
    const rBase = (Number(interestRate ?? 0) + Number(dividendRate ?? 0)) / 100;
    const inflAnual = Number(inflationRate ?? 0) / 100;
    const feeAnual = Number(annualFee ?? 0) / 100;
    const freq = Number(contributionFrequencyMonths ?? 1);
    const m = 12 / freq;
    const growth = Number(growthRate ?? 0) / 100;
    const tax = Number(taxRate ?? 0) / 100;

    const rows: Row[] = [];
    let aportado = P;
    let objetivoAlcanzado: number | undefined;

    for (let year = 1; year <= years; year++) {
      // rentabilidad anual variable si se define
      let rAnual = rBase;
      if (rentabilidadesAnuales && rentabilidadesAnuales.length >= year) {
        rAnual = rentabilidadesAnuales[year - 1] / 100;
      }

      // aportación periódica creciente
      const contribPorPeriodo = C * Math.pow(1 + growth, year - 1) * freq;

      // valor futuro de la inversión inicial
      const fvInicial = P * Math.pow(1 + rAnual / m, m * year);

      // valor futuro de aportaciones periódicas
      const fvAportaciones =
        contribPorPeriodo * ((Math.pow(1 + rAnual / m, m * year) - 1) / (rAnual / m));

      // aportaciones extraordinarias
      let fvExtras = 0;
      this.extraContributions.value.forEach((extra: any) => {
        if (extra.year <= year) {
          fvExtras += extra.amount * Math.pow(1 + rAnual, year - extra.year + 1);
        }
      });

      let valorNominal = fvInicial + fvAportaciones + fvExtras;

      // aplicar comisión
      valorNominal *= Math.pow(1 - feeAnual, year);

      // aplicar impuestos sobre beneficios
      const beneficios = valorNominal - aportado;
      if (beneficios > 0) {
        valorNominal -= beneficios * tax;
      }

      // evento de caída de mercado
      if (caidaMercado && year === Number(caidaMercado)) {
        valorNominal *= 1 - Number(caidaPorcentaje) / 100;
      }

      // valor real ajustado por inflación
      const valorReal = inflAnual > 0 ? valorNominal / Math.pow(1 + inflAnual, year) : valorNominal;

      // aportado hasta este año
      aportado =
        P +
        C * 12 * year +
        this.extraContributions.value
          .filter((extra: any) => extra.year <= year)
          .reduce((sum: number, extra: any) => sum + extra.amount, 0);

      rows.push({
        year,
        aportado: round2(aportado),
        intereses: round2(valorNominal - aportado),
        valorNominal: round2(valorNominal),
        valorReal: round2(valorReal),
      });

      // comprobar objetivo
      if (!objetivoAlcanzado && valorNominal >= objetivo) {
        objetivoAlcanzado = year;
      }
    }

    this.result = {
      totalNominal: rows.at(-1)?.valorNominal ?? 0,
      totalReal: rows.at(-1)?.valorReal ?? 0,
      objetivoAlcanzado,
      rows,
    };

    this.chartDataLine.labels = rows.map((r) => `Año ${r.year}`);
    this.chartDataLine.datasets = [
      {
        data: rows.map((r) => r.valorNominal),
        label: 'Valor nominal',
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.15)',
        fill: true,
        tension: 0.4,
      },
      {
        data: rows.map((r) => r.valorReal),
        label: 'Valor real',
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: false,
        borderDash: [6, 4],
        tension: 0.4,
      },
    ];

    this.chartDataBar.labels = rows.map((r) => `Año ${r.year}`);
    this.chartDataBar.datasets = [
      { label: 'Aportaciones', data: rows.map((r) => r.aportado), backgroundColor: '#3b82f6' },
      { label: 'Intereses', data: rows.map((r) => r.intereses), backgroundColor: '#16a34a' },
    ];
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
