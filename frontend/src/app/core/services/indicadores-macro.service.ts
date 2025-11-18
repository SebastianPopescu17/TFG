import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IndicadorMacro } from '../models/indicadores';
import { Kpi } from '../models/indicadores';

@Injectable({ providedIn: 'root' })
export class IndicadoresMacroService {
  private apiUrl = 'http://localhost:8000/api/indicadores';

  constructor(private http: HttpClient) {}

  getPaises(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/paises`);
  }

  getIndicadoresDisponibles(): Observable<{ codigo: string; nombre: string }[]> {
    return this.http.get<{ codigo: string; nombre: string }[]>(`${this.apiUrl}/disponibles`);
  }

  getIndicadores(params: { pais?: string; desde?: number; hasta?: number }): Observable<IndicadorMacro[]> {
    return this.http.get<IndicadorMacro[]>(`${this.apiUrl}`, { params: params as any });
  }

  getSeries(params: { paises?: string; codigos?: string; desde?: number; hasta?: number }): Observable<Record<string, Record<string, IndicadorMacro[]>>> {
    return this.http.get<Record<string, Record<string, IndicadorMacro[]>>>(`${this.apiUrl}/series`, { params: params as any });
  }

  getKpi(params: { pais: string; codigos: string }): Observable<Record<string, Kpi>> {
    return this.http.get<Record<string, Kpi>>(`${this.apiUrl}/kpi`, { params: params as any });
  }

  getCompare(params: { codigo: string; anio: number; paises?: string }): Observable<IndicadorMacro[]> {
    return this.http.get<IndicadorMacro[]>(`${this.apiUrl}/compare`, { params: params as any });
  }
}
