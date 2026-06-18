import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.baseUrl}/api/admin/dashboard`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getDashboardStats() {
    return this.http.get<any>(
      this.apiUrl,
      this.getHeaders()
    );
  }
}