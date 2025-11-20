import { PrecioHistorico } from './precio-historico';
import { IndicadorFinanciero } from './indicador-financiero';

export interface Empresa {
  id: number;
  ticker: string;
  nombre: string;
  sector?: string;
  industria?: string;
  pais?: string;
  capitalizacion?: number;
  per?: number;
  dividendo?: number;
  precio_actual?: number;
  moneda?: string;
  sitio_web?: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
  preciosHistoricos?: PrecioHistorico[];
  indicadoresFinancieros?: IndicadorFinanciero[];
}
