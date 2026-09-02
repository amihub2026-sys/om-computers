import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import {
  CategoryResponse,
  SingleCategoryResponse
} from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl =
    `${environment.baseUrl}/api/categories`;

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // AUTH HEADERS
  // ==========================================

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
  // GET ALL CATEGORIES
  // ==========================================

  getCategories() {

    return this.http.get<CategoryResponse>(
      this.apiUrl,
      this.getHeaders()
    );

  }


  // ==========================================
  // GET SINGLE CATEGORY
  // ==========================================

  getCategoryById(id: string) {

    return this.http.get<SingleCategoryResponse>(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );

  }


  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  createCategory(data: {
    name: string;
    specifications: string[];
  }) {

    return this.http.post<SingleCategoryResponse>(
      this.apiUrl,
      data,
      this.getHeaders()
    );

  }


  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  updateCategory(
    id: string,
    data: {
      name: string;
      specifications: string[];
    }
  ) {

    return this.http.put<SingleCategoryResponse>(
      `${this.apiUrl}/${id}`,
      data,
      this.getHeaders()
    );

  }


  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  deleteCategory(id: string) {

    return this.http.delete<{
      success: boolean;
      message: string;
    }>(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );

  }

}