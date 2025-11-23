import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChartCacheService {

  private cache: Record<string, { precios: any[], cambios: any[] }> = {};

  set(ticker: string, data: { precios: any[], cambios: any[] }) {
    this.cache[ticker] = data;
  }

  get(ticker: string) {
    return this.cache[ticker] ?? null;
  }

  append(ticker: string, punto: any, cambio?: any) {
    if (!this.cache[ticker]) return;

    this.cache[ticker].precios.push(punto);
    if (cambio) this.cache[ticker].cambios.push(cambio);

    // Limitar a 200 puntos
    this.cache[ticker].precios = this.cache[ticker].precios.slice(-200);
    this.cache[ticker].cambios = this.cache[ticker].cambios.slice(-200);
  }
}
