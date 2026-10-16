
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ReviewType = 'product' | 'service';

export interface ReviewRequest {
  reviewType: ReviewType;
  orderId?: string;
  bookingId?: string;
  productId?: string;
  rating: number;
  comment: string;
  images: string[];
}

export interface ReviewItem {
  _id: string;

userId: string | {
  name?: string;
};

  reviewType: ReviewType;
  orderId?: string;
  bookingId?: string;
  productId?: string;
  serviceId?: string;
  rating: number;
  comment: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
  
adminReply?: string;

}

export interface ReviewResponse {
  success: boolean;
  message?: string;
  data: ReviewItem;
}

export interface ReviewsResponse {
  success: boolean;
  message?: string;
  data: ReviewItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = `${environment.baseUrl}/api/reviews`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // Submit rating and written review
  
submitReview(
  data: ReviewRequest,
  files: File[] = []
): Observable<ReviewResponse> {

  const formData = new FormData();

  formData.append('reviewType', data.reviewType);
  formData.append('rating', String(data.rating));
  formData.append('comment', data.comment);

  if (data.orderId) {
    formData.append('orderId', data.orderId);
  }

  if (data.productId) {
    formData.append('productId', data.productId);
  }

  if (data.bookingId) {
    formData.append('bookingId', data.bookingId);
  }

  for (const file of files) {
    formData.append('images', file, file.name);
  }

  return this.http.post<ReviewResponse>(
    this.apiUrl,
    formData,
    this.getHeaders()
  );
}


updateReview(
  reviewId: string,
  rating: number,
  comment: string,
  keepImages: string[],
  newFiles: File[]
): Observable<ReviewResponse> {

  const formData = new FormData();

  formData.append('rating', String(rating));
  formData.append('comment', comment);
  formData.append(
    'keepImages',
    JSON.stringify(keepImages)
  );

  newFiles.forEach(file => {
    formData.append('images', file, file.name);
  });

  return this.http.patch<ReviewResponse>(
    `${this.apiUrl}/my/${reviewId}`,
    formData,
    this.getHeaders()
  );
}



  // Get reviews submitted by current customer
  getMyReviews(): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${this.apiUrl}/my`,
      this.getHeaders()
    );
  }

  // Get approved reviews for a product or service
  getPublicReviews(
    type: ReviewType,
    id: string
  ): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${this.apiUrl}/public/${type}/${id}`
    );
  }
}
