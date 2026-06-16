import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { LoginRequest } from '../interfaces/login-request';
import { RegisterRequest } from '../interfaces/register-request';
import { AuthResponse } from '../interfaces/auth-response';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  baseUrl = 'https://om-computers-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/login`,
      data
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/register`,
      data
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}