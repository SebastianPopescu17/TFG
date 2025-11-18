export interface Posicion {
  empresa_id: number;
  empresa: string;
  ticker: string;
  cantidad: number;
  precio_medio: number;
  precio_actual: number;
  valor_invertido: number;
  valor_actual: number;
  rentabilidad: number;
  rentabilidad_pct: number;
}

export interface Resumen {
  total_invertido: number;
  total_actual: number;
  rentabilidad_total: number;
  rentabilidad_pct: number;
}
