
export interface IndicadorMacro {
  pais: string;
  codigo: string;
  nombre: string;
  unidad: string;
  anio: number;
  valor: number;
  valor_usd: number;
  valor_eur: number;
  variacion: number | null;
  fecha: string; // formato YYYY-MM-DD
}


export interface Kpi {
  anio: number;
  valor_usd: number;
  valor_eur: number;
  variacion: number | null;
  unidad: string;
  nombre: string;
}
