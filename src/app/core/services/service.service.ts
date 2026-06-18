import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ServiceResponse,
  SingleServiceResponse
} from '../interfaces/service.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private apiUrl = `${environment.baseUrl}/api/services`;

  constructor(private http: HttpClient) {}

  getServices(): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(this.apiUrl);
  }

  getServiceById(id: string): Observable<SingleServiceResponse> {
    return this.http.get<SingleServiceResponse>(`${this.apiUrl}/${id}`);
  }

  addService(serviceData: FormData): Observable<SingleServiceResponse> {
    return this.http.post<SingleServiceResponse>(this.apiUrl, serviceData);
  }

  updateService(id: string, serviceData: FormData): Observable<SingleServiceResponse> {
    return this.http.put<SingleServiceResponse>(`${this.apiUrl}/${id}`, serviceData);
  }

  deleteService(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
  
}