import { Empresa } from './empresa';

export interface Alerta {
  id: number;
  empresa_id: number;
  empresa?: Empresa;
  tipo: 'precio' | 'noticia' | 'otro';
  valor: number;          
  condicion: 'mayor' | 'menor' | 'igual';
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}
