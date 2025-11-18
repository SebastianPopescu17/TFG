
import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
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
}
