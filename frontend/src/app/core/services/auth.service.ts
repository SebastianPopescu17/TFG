import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
     this.currentUserSubject.next(null);
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
      this.currentUserSubject.next(res.user);
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }


  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }


  resetPassword(data: { usuario: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }
}
