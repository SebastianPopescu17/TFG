export interface Orden {
  id: number;
  user_id: number;
  empresa_id: number;
  tipo: 'compra' | 'venta';
  cantidad: number;
  precio_objetivo?: number | null;
  scheduled_at?: string | null;
  estado: 'pendiente' | 'cumplida' | 'cancelada';
  motivo_cancelacion?: string | null;
  cantidad_ejecutada?: number;
  created_at: string;
  updated_at: string;
  precio_actual?: number | null;


  empresa?: {
    id: number;
    nombre: string;
    ticker: string;
    precio_actual: number;
  };
}

export interface OrdenCreate {
  empresa_id: number;
  tipo: 'compra' | 'venta';
  cantidad: number;
  precio_objetivo?: number;
  scheduled_at?: string;
}
