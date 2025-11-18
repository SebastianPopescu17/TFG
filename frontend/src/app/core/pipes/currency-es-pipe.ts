import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyEs',
  standalone: true,
})
export class CurrencyEsPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currency: string = 'EUR',
    decimals: number = 2,
    locale: string = 'es-ES',
    compact: boolean = false
  ): string {
    if (value == null) return '';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      notation: compact ? 'compact' : 'standard',
    }).format(value);
  }
}
