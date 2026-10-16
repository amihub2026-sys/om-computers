
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

type ReviewStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Hidden';

interface ReviewUser {
  _id: string;
  name?: string;
  email?: string;
}

interface ReviewTarget {
  _id: string;
  name?: string;
  image?: string;
}


interface AdminReview {
  _id: string;

  userId: ReviewUser | string;

  reviewType: 'product' | 'service';

  productId?: ReviewTarget | string;
  serviceId?: ReviewTarget | string;

  orderId?: string;

  rating: number;
  comment: string;
  images: string[];

  isApproved: boolean;
  moderationStatus?: ReviewStatus;

  adminReply?: string;

  createdAt: string;
  moderatedAt?: string;
  
bookingId?: string | {
  _id: string;
  serviceName?: string;
  serviceId?: string;
};

}

interface ReviewsApiResponse {
  success: boolean;
  data: AdminReview[];
  message?: string;
}

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './manage-reviews.html',
  styleUrl: './manage-reviews.css'
})
export class ManageReviews implements OnInit {

  private readonly apiUrl =
    `${environment.baseUrl}/api/reviews/admin`;

  reviews: AdminReview[] = [];

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  selectedStatus = 'All';
  selectedType = 'All';
  searchText = '';

  selectedReview: AdminReview | null = null;
  replyText = '';

  currentPage = 1;
  readonly pageSize = 10;

  readonly stars = [1, 2, 3, 4, 5];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('admin_token') || '';

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}


  loadReviews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<ReviewsApiResponse>(
      this.apiUrl,
      { headers: this.getHeaders() }
    ).subscribe({
      next: response => {
        this.reviews =
          response.success && Array.isArray(response.data)
            ? response.data
            : [];

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: error => {
        console.error('Load admin reviews failed:', error);

        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Unable to load reviews';

        this.cdr.detectChanges();
      }
    });
  }

  getCustomerName(review: AdminReview): string {
    if (
      review.userId &&
      typeof review.userId === 'object'
    ) {
      return review.userId.name || 'Customer';
    }

    return 'Customer';
  }

  getCustomerEmail(review: AdminReview): string {
    if (
      review.userId &&
      typeof review.userId === 'object'
    ) {
      return review.userId.email || '';
    }

    return '';
  }


getItemName(review: AdminReview): string {
  if (review.reviewType === 'service') {
    const service = review.serviceId;

    if (service && typeof service === 'object' && service.name) {
      return service.name;
    }

    const booking = review.bookingId;

    if (
      booking &&
      typeof booking === 'object' &&
      booking.serviceName
    ) {
      return booking.serviceName;
    }

    return 'Service';
  }

  const product = review.productId;

  if (product && typeof product === 'object' && product.name) {
    return product.name;
  }

  return 'Product';
}

  getStatus(review: AdminReview): ReviewStatus {
    return review.moderationStatus ||
      (review.isApproved ? 'Approved' : 'Pending');
  }

  get filteredReviews(): AdminReview[] {
    const query = this.searchText.trim().toLowerCase();

    return this.reviews.filter(review => {
      const statusMatches =
        this.selectedStatus === 'All' ||
        this.getStatus(review) === this.selectedStatus;

      const typeMatches =
        this.selectedType === 'All' ||
        review.reviewType === this.selectedType;

      const searchableText = [
        this.getCustomerName(review),
        this.getCustomerEmail(review),
        this.getItemName(review),
        review.comment
      ].join(' ').toLowerCase();

      return statusMatches &&
        typeMatches &&
        (!query || searchableText.includes(query));
    });
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredReviews.length / this.pageSize)
    );
  }

  get paginatedReviews(): AdminReview[] {
    const page = Math.min(this.currentPage, this.totalPages);
    const start = (page - 1) * this.pageSize;

    return this.filteredReviews.slice(
      start,
      start + this.pageSize
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  get totalReviews(): number {
    return this.reviews.length;
  }

  get pendingCount(): number {
    return this.reviews.filter(
      review => this.getStatus(review) === 'Pending'
    ).length;
  }

  get approvedCount(): number {
    return this.reviews.filter(
      review => this.getStatus(review) === 'Approved'
    ).length;
  }

  get rejectedCount(): number {
    return this.reviews.filter(
      review => this.getStatus(review) === 'Rejected'
    ).length;
  }

  openReview(review: AdminReview): void {
    this.selectedReview = review;
    this.replyText = review.adminReply || '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeReview(): void {
    if (this.isSaving) return;

    this.selectedReview = null;
    this.replyText = '';
  }

  moderateReview(
    review: AdminReview,
    status: ReviewStatus
  ): void {
    if (this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const adminReply =
      this.selectedReview?._id === review._id
        ? this.replyText.trim()
        : review.adminReply || '';

    this.http.patch<{
      success: boolean;
      message?: string;
      data?: AdminReview;
    }>(
      `${this.apiUrl}/${review._id}`,
      {
        status,
        adminReply
      },
      {
        headers: this.getHeaders()
      }
    ).subscribe({
      next: response => {
        this.isSaving = false;

        if (!response.success) {
          this.errorMessage =
            response.message || 'Unable to update review';
          this.cdr.detectChanges();
          return;
        }

        review.moderationStatus = status;
        review.isApproved = status === 'Approved';
        review.adminReply = adminReply;

        this.successMessage =
          response.message || 'Review updated successfully';

        this.selectedReview = null;
        this.cdr.detectChanges();
      },

      error: error => {
        console.error('Review moderation failed:', error);

        this.isSaving = false;
        this.errorMessage =
          error.error?.message || 'Unable to update review';

        this.cdr.detectChanges();
      }
    });
  }

  saveReply(review: AdminReview): void {
    this.moderateReview(review, this.getStatus(review));
  }

  trackByReviewId(
    index: number,
    review: AdminReview
  ): string {
    return review._id;
  }
}
