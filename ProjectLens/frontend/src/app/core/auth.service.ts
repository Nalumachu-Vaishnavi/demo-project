import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, User } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(this.readUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(response => {
        localStorage.setItem('plens_token', response.token);
        localStorage.setItem('plens_user', JSON.stringify(response.user));
        this.user.set(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('plens_token');
    localStorage.removeItem('plens_user');
    this.user.set(null);
    this.router.navigateByUrl('/login');
  }

  token(): string | null {
    return localStorage.getItem('plens_token');
  }

  isLoggedIn(): boolean {
    return Boolean(this.token() && this.user());
  }

  private readUser(): User | null {
    const value = localStorage.getItem('plens_user');
    if (!value) return null;

    try {
      return JSON.parse(value) as User;
    } catch {
      localStorage.removeItem('plens_user');
      return null;
    }
  }
}
