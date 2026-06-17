import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiceBookingForm } from '../interfaces/service.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = `${environment.baseUrl}/api/bookings`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  createBooking(data: ServiceBookingForm): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }
  getBookings(): Observable<any> {
  return this.http.get(this.apiUrl, this.getHeaders());
}
getBookingById(id: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
}

updateBooking(id: string, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
}
}