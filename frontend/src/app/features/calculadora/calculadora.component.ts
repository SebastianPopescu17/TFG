import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CurrencyEsPipe } from '../../core/pipes/currency-es-pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogoAyudaComponent } from './dialogo-ayuda/dialogo-ayuda.component';
import { CalculadoraService, Row } from '../../core/services/calculadora.service';
import { ValidationService } from '../../core/services/validation.service';
import { ChartService } from '../../core/services/chart.service';

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
    MatDialogModule,
    MatSlideToggleModule,
  ],
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css'],
})
export class CalculadoraComponent implements OnInit {
  form!: FormGroup;
  result: any | null = null;

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            if (Number(value) >= 1000000) return Number(value) / 1000000 + 'M';
            if (Number(value) >= 1000) return Number(value) / 1000 + 'k';
            return value;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },

      tooltip: {
        enabled: true,
      },
      datalabels: {
        display: false,
      },
    },
  };

  chartDataLine: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptionsLine: ChartConfiguration<'line'>['options'] = this.chartOptions;

  chartDataBar: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptionsBar: ChartConfiguration<'bar'>['options'] = this.chartOptions;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private calculadoraService: CalculadoraService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      initialInvestment: [10000, [Validators.required, Validators.min(0)]],
      monthlyContribution: [500, [Validators.required, Validators.min(0)]],
      years: [30, [Validators.required, Validators.min(1), Validators.max(60)]],
      growthRate: [2, [Validators.min(0)]],
      retirementStartYear: [20, [Validators.min(1)]],
      annualWithdrawal: [12000, [Validators.min(0)]],
      withdrawalGrowthRate: [2, [Validators.min(0)]],
      interestRate: [7, [Validators.required, Validators.min(0), Validators.max(100)]],
      dividendRate: [2, [Validators.min(0), Validators.max(20)]],
      inflationRate: [2, [Validators.min(0), Validators.max(100)]],
      annualFee: [1, [Validators.min(0), Validators.max(5)]],
      taxRate: [19, [Validators.min(0)]],
      objetivo: [500000],
      rentabilidadesAnuales: [[], [ValidationService.rentabilidadesValidator]],
      marketCrashEvents: this.fb.array([]),
      extraContributions: this.fb.array([]),
      isMonteCarlo: [false],
      standardDeviation: [15, [Validators.min(0)]],
      simulationCount: [1000, [Validators.min(100), Validators.max(10000)]],
    });
  }

  openHelp() {
    this.dialog.open(DialogoAyudaComponent, { width: '700px', maxHeight: '90vh' });
  }

  get extraContributions(): FormArray {
    return this.form.get('extraContributions') as FormArray;
  }

  get marketCrashEvents(): FormArray {
    return this.form.get('marketCrashEvents') as FormArray;
  }

  addExtraContribution() {
    this.extraContributions.push(this.fb.group({ year: [1], amount: [1000] }));
  }

  addMarketCrashEvent() {
    this.marketCrashEvents.push(this.fb.group({ year: [5], percentage: [20] }));
  }

  removeExtraContribution(index: number) {
    this.extraContributions.removeAt(index);
  }

  removeMarketCrashEvent(index: number) {
    this.marketCrashEvents.removeAt(index);
  }

  onRentabilidadesBlur(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value || '';
    const rentabilidades = value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v));
    this.form.patchValue({ rentabilidadesAnuales: rentabilidades });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.result = this.calculadoraService.calcular(this.form.value);

    if (this.result.type === 'monte_carlo') {
      this.chartDataLine = this.chartService.getMonteCarloLineChartData(this.result);
    } else {
      this.chartDataLine = this.chartService.getLineChartData(this.result.rows);
      this.chartDataBar = this.chartService.getBarChartData(this.result.rows);
    }
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
  }
}
