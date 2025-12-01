import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IndicadorMacro } from '../models/indicadores';
import { Kpi } from '../models/indicadores';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class IndicadoresMacroService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

getPaises(): Observable<string[]> {
  return this.http.get<string[]>(`${this.baseUrl}/indicadores/paises`);
}

getIndicadoresDisponibles(): Observable<{ codigo: string; nombre: string }[]> {
  return this.http.get<{ codigo: string; nombre: string }[]>(`${this.baseUrl}/indicadores/disponibles`);
}

getIndicadores(params: any) {
  return this.http.get(`${this.baseUrl}/indicadores`, { params });
}


}

