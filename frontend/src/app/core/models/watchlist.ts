import { Empresa } from './empresa';

export interface WatchlistItem {
  id: number;
  empresa_id: number;
  empresa?: Empresa;
  created_at?: string;
  updated_at?: string;
}
