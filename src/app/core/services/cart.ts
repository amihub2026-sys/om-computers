
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CartItem,
  UpdateCartRequest
} from '../interfaces/cart.interface';

interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class Cart {

  private readonly apiUrl = `${environment.baseUrl}/api/cart`;

  constructor(private http: HttpClient) {}

  private authOptions() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token || ''}`
      })
    };
  }

  getCartItems(): Observable<CartResponse> {
    return this.http.get<CartResponse>(
      this.apiUrl,
      this.authOptions()
    );
  }

  addToCart(data: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      data,
      this.authOptions()
    );
  }

  updateCartItem(
    id: string,
    data: UpdateCartRequest
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      data,
      this.authOptions()
    );
  }

  deleteCartItem(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      this.authOptions()
    );
  }

  // Cart is now stored in MongoDB.
  // No browser cart data is deleted here.
  clearCart(): void {
    window.dispatchEvent(new Event('cart-updated'));
  }
}
