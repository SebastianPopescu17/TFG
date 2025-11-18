import { Empresa } from './empresa';

export interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fuente?: string;
  fecha_publicacion: string;
  empresa_id?: number;
  empresa?: Empresa;
  enlace?: string;
  descripcion: string;
  url: string;
  fecha?: string;
}
