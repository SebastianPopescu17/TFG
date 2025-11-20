import { Empresa } from './empresa';

export interface Alerta {
  id: number;
  empresa_id: number;
  empresa?: Empresa;
  tipo: 'precio' | 'noticia' | 'otro';
  valor: number | [number, number];   
  condicion: 'mayor' | 'menor' | 'igual' | 'entre';
  activa: boolean;
  created_at?: string;
  updated_at?: string;
  fechaCumplida?: Date;
}
