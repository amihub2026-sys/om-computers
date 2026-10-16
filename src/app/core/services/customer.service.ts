import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import {
  Customer,
  CustomerResponse
} from '../interfaces/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = `${environment.baseUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}


private getHeaders() {
  const token =
    localStorage.getItem('admin_token') || '';

  return {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  };
}



  // ==========================================
  // GET CUSTOMERS / USERS
  // ==========================================

  getCustomers() {

    return this.http.get<CustomerResponse>(
      this.apiUrl,
      this.getHeaders()
    );

  }


  // ==========================================
  // UPDATE USER STATUS
  // ==========================================

  updateUserStatus(
    id: string,
    isActive: boolean
  ) {

    return this.http.put<{
      success: boolean;
      message: string;
      data: Customer;
    }>(
      `${this.apiUrl}/${id}/status`,
      { isActive },
      this.getHeaders()
    );

  }


  // ==========================================
  // UPDATE USER ROLE
  // ==========================================

  updateUserRole(
    id: string,
    role: 'user' | 'admin'
  ) {

    return this.http.put<{
      success: boolean;
      message: string;
      data: Customer;
    }>(
      `${this.apiUrl}/${id}/role`,
      { role },
      this.getHeaders()
    );

  }


  // ==========================================
  // CREATE ADMIN
  // ==========================================

  createAdmin(data: any) {

    return this.http.post<{
      success: boolean;
      message: string;
      data: Customer;
    }>(
      `${this.apiUrl}/admin`,
      data,
      this.getHeaders()
    );

  }


  // ==========================================
  // UPDATE ADMIN
  // ==========================================

  updateAdmin(
    id: string,
    data: any
  ) {

    return this.http.put<{
      success: boolean;
      message: string;
      data: Customer;
    }>(
      `${this.apiUrl}/${id}`,
      data,
      this.getHeaders()
    );

  }


  // ==========================================
  // DELETE ADMIN
  // ==========================================

  deleteAdmin(id: string) {

    return this.http.delete<{
      success: boolean;
      message: string;
    }>(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );

  }

}