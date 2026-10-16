import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  OrderItem,
  OrderResponse,
  SingleOrderResponse,
  PlaceOrderRequest
} from '../interfaces/order.interface';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Order {

  private baseUrl = `${environment.baseUrl}/api/orders`;
  private adminBaseUrl = `${environment.baseUrl}/api/admin/orders`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

private getAdminHeaders() {
  const token = localStorage.getItem('admin_token') || '';

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

  createOrder(data: PlaceOrderRequest) {
    return this.http.post<SingleOrderResponse>(
      this.baseUrl,
      data,
      this.getHeaders()
    );
  }

  placeOrder(data: PlaceOrderRequest) {
    return this.http.post<SingleOrderResponse>(
      `${this.baseUrl}/place-order`,
      data,
      this.getHeaders()
    );
  }

  
buyNowOrder(data: {
  productId: string;
  quantity: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: string;
  transactionId: string;
}) {
  return this.http.post<SingleOrderResponse>(
    `${this.baseUrl}/buy-now`,
    data,
    this.getHeaders()
  );
}

placeGuestOrder(data: any) {
  return this.http.post<SingleOrderResponse>(
    `${this.baseUrl}/guest-order`,
    data
  );
}
  updateOrder(
    id: string,
    data: Partial<OrderItem>
  ) {
    return this.http.put<SingleOrderResponse>(
      `${this.baseUrl}/${id}`,
      data,
      this.getHeaders()
    );
  }

  deleteOrder(id: string) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}`,
      this.getHeaders()
    );
  }

 
getAdminOrders() {
  const token = localStorage.getItem('admin_token') || '';

  return this.http.get<OrderResponse>(
    `${this.baseUrl}/admin/all`,
    {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    }
  );
}



updateAdminOrderStatus(
  id: string,
  status: OrderItem['orderStatus'],
  cancellationReason: string = ''
) {
  const token = localStorage.getItem('admin_token') || '';

  return this.http.put<SingleOrderResponse>(
    `${this.adminBaseUrl}/${id}/status`,
    {
      orderStatus: status,
      cancellationReason
    },
    {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    }
  );
}

 
updateAdminPaymentStatus(
  id: string,
  status: OrderItem['paymentStatus']
) {
  const token = localStorage.getItem('admin_token') || '';

  return this.http.put<SingleOrderResponse>(
    `${this.adminBaseUrl}/${id}/payment-status`,
    { paymentStatus: status },
    {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    }
  );
}

}