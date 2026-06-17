import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiceBookingForm } from '../interfaces/service.interface';
import {
  BookingResponse,
  SingleBookingResponse,
  BookingStatus,
  BookingStatusUpdateResponse
} from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = `${environment.baseUrl}/api/bookings`;
  private adminApiUrl = `${environment.baseUrl}/api/admin/bookings`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  createBooking(data: ServiceBookingForm): Observable<SingleBookingResponse> {
    return this.http.post<SingleBookingResponse>(
      this.apiUrl,
      data,
      this.getHeaders()
    );
  }

  getBookings(): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(
      this.apiUrl,
      this.getHeaders()
    );
  }

  getBookingById(id: string): Observable<SingleBookingResponse> {
    return this.http.get<SingleBookingResponse>(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );
  }

  updateBooking(
    id: string,
    data: Partial<{ status: BookingStatus }>
  ): Observable<SingleBookingResponse> {
    return this.http.put<SingleBookingResponse>(
      `${this.apiUrl}/${id}`,
      data,
      this.getHeaders()
    );
  }

  getAdminBookings(): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(
      this.adminApiUrl,
      this.getHeaders()
    );
  }

  updateAdminBookingStatus(
    id: string,
    status: BookingStatus
  ): Observable<BookingStatusUpdateResponse> {
    return this.http.put<BookingStatusUpdateResponse>(
      `${this.adminApiUrl}/${id}/status`,
      { status },
      this.getHeaders()
    );
  }
}