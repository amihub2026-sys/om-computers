import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cart {

  baseUrl = `${environment.baseUrl}/api/carts`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getCartItems() {
    return this.http.get(this.baseUrl, this.getHeaders());
  }

  addToCart(data: any) {
    return this.http.post(this.baseUrl, data, this.getHeaders());
  }

  updateCartItem(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}`, data, this.getHeaders());
  }

  deleteCartItem(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}