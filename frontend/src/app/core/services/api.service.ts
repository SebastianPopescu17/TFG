import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa';
import { Alerta } from '../models/alerta';
import { PrecioHistorico } from '../models/precio-historico';
import { IndicadorFinanciero } from '../models/indicador-financiero';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- EMPRESAS ---
  getEmpresas(params?: any): Observable<{ data: Empresa[] }> {
    return this.http.get<any>(`${this.baseUrl}/empresas`, { params }).pipe(
      map((res: any) => ({
        data: res.data.map((e: any) => ({
          ...e,
          id: e.id ?? e.empresa_id ?? e.id_empresa ?? e.ticker,
        })),
      }))
    );
  }

  getEmpresa(idOrTicker: number | string): Observable<Empresa> {
    return this.http.get<any>(`${this.baseUrl}/empresas/${idOrTicker}`).pipe(
      map((e: any) => ({
        ...e,
        id: e.id ?? e.empresa_id ?? e.id_empresa ?? e.ticker,
        indicadoresFinancieros: e.indicadoresFinancieros ?? e.indicadores_financieros ?? [],
      }))
    );
  }

  getHistorico(ticker: string): Observable<PrecioHistorico[]> {
    return this.http.get<PrecioHistorico[]>(`${this.baseUrl}/empresas/${ticker}/historico`);
  }

  getGrafica(
    ticker: string
  ): Observable<{ empresa: string; ticker: string; datos: { fecha: string; cierre: number }[] }> {
    return this.http.get<{
      empresa: string;
      ticker: string;
      datos: { fecha: string; cierre: number }[];
    }>(`${this.baseUrl}/empresas/${ticker}/grafica`);
  }

  // --- INDICADORES FINANCIEROS ---
  getIndicadoresFinancieros(empresaId: number): Observable<IndicadorFinanciero[]> {
    return this.http.get<IndicadorFinanciero[]>(
      `${this.baseUrl}/empresas/${empresaId}/indicadores`
    );
  }

  // --- PRECIOS HISTÓRICOS ---
  getPreciosHistoricos(
    empresaId: number,
    params?: { desde?: string; hasta?: string }
  ): Observable<PrecioHistorico[]> {
    return this.http.get<PrecioHistorico[]>(
      `${this.baseUrl}/empresas/${empresaId}/precios-historicos`,
      { params }
    );
  }

  // --- WATCHLIST ---
  getWatchlist(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.baseUrl}/watchlist`);
  }

  addToWatchlist(ticker: string) {
    return this.http.post(`${this.baseUrl}/watchlist`, { ticker });
  }

  removeFromWatchlist(empresaIdOrTicker: number | string) {
    return this.http.delete(`${this.baseUrl}/watchlist/${empresaIdOrTicker}`);
  }

  // --- ALERTAS ---
  getAlertas(userId: number): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.baseUrl}/users/${userId}/alertas`);
  }

  createAlerta(userId: number, data: Partial<Alerta>): Observable<Alerta> {
    return this.http.post<Alerta>(`${this.baseUrl}/users/${userId}/alertas`, data);
  }

  deleteAlerta(userId: number, alertaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}/alertas/${alertaId}`);
  }

  updateAlerta(userId: number, alertaId: number, body: any) {
    return this.http.patch(`${this.baseUrl}/users/${userId}/alertas/${alertaId}`, body);
  }

  evaluarAlertas(userId: number) {
    return this.http.post<Alerta[]>(`${this.baseUrl}/users/${userId}/alertas/evaluar`, {});
  }

  getIndicadoresPorTicker(ticker: string): Observable<IndicadorFinanciero[]> {
    return this.http.get<IndicadorFinanciero[]>(`${this.baseUrl}/empresas/${ticker}/indicadores`);
  }

  getTicks(id: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/empresas/${id}/ticks`).pipe(
      map((ticks) =>
        ticks.map((t) => ({
          x: new Date(t.registrado_en).getTime(),
          y: t.cierre,
        }))
      )
    );
  }

  // --- CARTERA ---
  getCartera(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cartera`);
  }

  getOperaciones(page = 1): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cartera/operaciones?page=${page}`);
  }

  comprar(payload: { empresa_id: number; cantidad: number; precio: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cartera/comprar`, payload);
  }

  vender(payload: { empresa_id: number; cantidad: number; precio: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cartera/vender`, payload);
  }
  // --- SALDO ---
  getSaldo(): Observable<{ saldo: number }> {
    return this.http.get<{ saldo: number }>(`${this.baseUrl}/saldo`);
  }

  ingresarSaldo(monto: number): Observable<{ saldo: number }> {
    return this.http.post<{ saldo: number }>(`${this.baseUrl}/saldo/ingresar`, { monto });
  }

  retirarSaldo(monto: number): Observable<{ saldo: number }> {
    return this.http.post<{ saldo: number }>(`${this.baseUrl}/saldo/retirar`, { monto });
  }

  getMovimientosSaldo(page = 1): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/saldo/movimientos?page=${page}`);
  }
  // --- POSICIÓN DE LA EMPRESA ---
  getPosicion(empresaId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/posiciones/${empresaId}`);
  }
  // Últimos precios de todas las empresas
  getUltimosPrecios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/precios/ultimos`);
  }

  // Último precio de una empresa concreta
  getUltimoPrecio(empresaId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/empresas/${empresaId}/precio`);
  }

  // Guardar un nuevo precio (si decides hacerlo desde el front)
  updatePrecioEmpresa(empresaId: number, precio: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/empresas/${empresaId}/precio`, { precio });
  }
}
