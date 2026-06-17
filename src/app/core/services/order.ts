import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  OrderResponse,
  SingleOrderResponse,
  PlaceOrderRequest
} from '../interfaces/order.interface';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class Order {

  baseUrl = `${environment.baseUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

getOrders() {
  return this.http.get<OrderResponse>(
    this.baseUrl,
    this.getHeaders()
  );
}

 getOrderById(id: string) {
  return this.http.get<SingleOrderResponse>(
    `${this.baseUrl}/${id}`,
    this.getHeaders()
  );
}

  createOrder(data: any) {
    return this.http.post(this.baseUrl, data, this.getHeaders());
  }

  placeOrder(data: PlaceOrderRequest) {
    return this.http.post(
      `${this.baseUrl}/place-order`,
      data,
      this.getHeaders()
    );
  }

  updateOrder(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}`, data, this.getHeaders());
  }

  deleteOrder(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}