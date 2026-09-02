import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  environment
} from '../../../environments/environment';

import {
  InventoryResponse,
  SingleInventoryResponse
} from '../interfaces/inventory.interface';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl =
    `${environment.baseUrl}/api/inventory`;


  constructor(
    private http: HttpClient
  ) {}


  private getHeaders() {

    const token =
      localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };

  }


  // ==========================================
  // GET ALL INVENTORY
  // ==========================================

  getInventory() {

    return this.http
      .get<InventoryResponse>(
        this.apiUrl,
        this.getHeaders()
      );

  }


  // ==========================================
  // GET SINGLE INVENTORY ITEM
  // ==========================================

  getInventoryById(
    id: string
  ) {

    return this.http
      .get<SingleInventoryResponse>(
        `${this.apiUrl}/${id}`,
        this.getHeaders()
      );

  }


  // ==========================================
  // CREATE INVENTORY ITEM
  // ==========================================

  createInventory(
    data: any
  ) {

    return this.http
      .post<SingleInventoryResponse>(
        this.apiUrl,
        data,
        this.getHeaders()
      );

  }


  // ==========================================
  // UPDATE INVENTORY ITEM
  // ==========================================

  updateInventory(
    id: string,
    data: any
  ) {

    return this.http
      .put<SingleInventoryResponse>(
        `${this.apiUrl}/${id}`,
        data,
        this.getHeaders()
      );

  }


  // ==========================================
  // DELETE INVENTORY ITEM
  // ==========================================

  deleteInventory(
    id: string
  ) {

    return this.http
      .delete<{
        success: boolean;
        message: string;
      }>(
        `${this.apiUrl}/${id}`,
        this.getHeaders()
      );

  }

}