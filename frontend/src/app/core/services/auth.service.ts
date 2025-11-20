import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((res: any) => this.setSession(res))
    );
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data).pipe(
      tap((res: any) => this.setSession(res))
    );
  }

  private setSession(res: any) {
    if (res.token) {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.userKey, JSON.stringify(res.user));
      this.currentUser = res.user;
    }
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser = null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    }).pipe(
      tap(user => {
        this.currentUser = user;
        localStorage.setItem(this.userKey, JSON.stringify(user));
      })
    );
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentUserId(): number | null {
    return this.currentUser ? this.currentUser.id : null;
  }

  resetPassword(data: { usuario: string; password: string; password_confirmation: string }) {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }
}
