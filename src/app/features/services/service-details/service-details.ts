
import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import {
  Subject,
  Subscription,
  takeUntil
} from 'rxjs';

import { Toast } from '../../../core/services/toast';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/interfaces/service.interface';

import {
  ReviewService,
  ReviewItem
} from '../../../core/services/review.service';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-details.html',
  styleUrl: './service-details.css'
})
export class ServiceDetails implements OnInit, OnDestroy {

  // =====================================
  // SERVICE DATA
  // =====================================

  service?: Service;

  isLoading = true;

  // =====================================
  // IMAGE CONFIGURATION
  // =====================================

  readonly fallbackImage =
    '/assets/images/categories/laptop.png';

  readonly imageBaseUrl =
    `${environment.baseUrl.replace(/\/+$/, '')}/uploads/services/`;

  // =====================================
  // CUSTOMER REVIEWS
  // =====================================

  reviews: ReviewItem[] = [];

  isReviewsLoading = false;
  reviewsError = '';

  readonly stars = [1, 2, 3, 4, 5];
  readonly reviewsPerPage = 3;

  visibleReviewCount = 3;

  // =====================================
  // SUBSCRIPTION CLEANUP
  // =====================================

  private destroy$ = new Subject<void>();

  private serviceSubscription?: Subscription;
  private reviewSubscription?: Subscription;

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast,
    private serviceService: ServiceService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const serviceId = params.get('id');

        if (!serviceId) {
          this.toast.error(
            'Invalid service link',
            'Error'
          );

          this.router.navigate(['/services']);
          return;
        }

        this.loadService(serviceId);
        this.loadServiceReviews(serviceId);
      });
  }

  // =====================================
  // LOAD SERVICE DETAILS
  // =====================================

  loadService(id: string): void {
    this.serviceSubscription?.unsubscribe();

    this.service = undefined;
    this.isLoading = true;

    this.serviceSubscription =
      this.serviceService.getServiceById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            const serviceData =
              response?.data ?? response;

            if (!serviceData || !serviceData._id) {
              this.isLoading = false;

              this.toast.error(
                'Service not found',
                'Error'
              );

              this.router.navigate(['/services']);
              return;
            }

            this.service = serviceData as Service;
            this.isLoading = false;

            this.cdr.detectChanges();
          },

          error: (error) => {
            console.error(
              'Failed to load service:',
              error
            );

            this.isLoading = false;

            this.toast.error(
              'Unable to load service details',
              'Error'
            );

            this.cdr.detectChanges();

            this.router.navigate(['/services']);
          }
        });
  }

  // =====================================
  // LOAD APPROVED SERVICE REVIEWS
  // =====================================

  loadServiceReviews(serviceId: string): void {
    this.reviewSubscription?.unsubscribe();

    this.reviews = [];
    this.reviewsError = '';
    this.isReviewsLoading = true;
    this.visibleReviewCount = this.reviewsPerPage;

    this.reviewSubscription =
      this.reviewService
        .getPublicReviews('service', serviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: response => {
            this.reviews =
              response.success && Array.isArray(response.data)
                ? response.data
                    .filter(review => review.reviewType === 'service')
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                : [];

            this.isReviewsLoading = false;
            this.cdr.detectChanges();
          },

          error: error => {
            console.error(
              'Failed to load service reviews:',
              error
            );

            this.reviews = [];
            this.isReviewsLoading = false;
            this.reviewsError =
              'Unable to load customer reviews.';

            this.cdr.detectChanges();
          }
        });
  }

  // =====================================
  // AVERAGE RATING
  // =====================================

  get totalReviews(): number {
    return this.reviews.length;
  }

  get averageRating(): number {
    if (!this.reviews.length) {
      return 0;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return total / this.reviews.length;
  }

  get formattedAverageRating(): string {
    return this.averageRating.toFixed(1);
  }

  // =====================================
  // RATING DISTRIBUTION
  // =====================================

  getRatingCount(rating: number): number {
    return this.reviews.filter(
      review => Number(review.rating) === rating
    ).length;
  }

  getRatingPercentage(rating: number): number {
    if (!this.totalReviews) {
      return 0;
    }

    return Math.round(
      (this.getRatingCount(rating) / this.totalReviews) * 100
    );
  }

  isStarFilled(star: number, rating: number): boolean {
    return star <= Math.round(rating);
  }

  // =====================================
  // REVIEW CUSTOMER NAME
  // =====================================

  getReviewerName(review: ReviewItem): string {
    const user = review.userId as unknown;

    if (user && typeof user === 'object') {
      const customer = user as {
        name?: string;
      };

      if (customer.name?.trim()) {
        return customer.name;
      }
    }

    return 'Verified Customer';
  }

  // =====================================
  // REVIEWS PAGINATION
  // =====================================

  get visibleReviews(): ReviewItem[] {
    return this.reviews.slice(
      0,
      this.visibleReviewCount
    );
  }

  get hasMoreReviews(): boolean {
    return this.visibleReviewCount < this.reviews.length;
  }

  get canShowLessReviews(): boolean {
    return this.visibleReviewCount > this.reviewsPerPage;
  }

  showMoreReviews(): void {
    this.visibleReviewCount = Math.min(
      this.visibleReviewCount + this.reviewsPerPage,
      this.reviews.length
    );
  }

  showLessReviews(): void {
    this.visibleReviewCount = this.reviewsPerPage;
  }

  // =====================================
  // REVIEW IMAGES
  // =====================================

  getReviewImages(review: ReviewItem): string[] {
    return Array.isArray(review.images)
      ? review.images.filter(
          image =>
            typeof image === 'string' &&
            /^https:\/\//i.test(image)
        )
      : [];
  }

  // =====================================
  // SERVICE IMAGE URL
  // CLOUDFLARE R2 + LOCAL UPLOADS
  // =====================================

  getServiceImage(image: unknown): string {
    if (!image) {
      return this.fallbackImage;
    }

    const value = Array.isArray(image)
      ? image[0]
      : image;

    if (
      typeof value !== 'string' ||
      !value.trim()
    ) {
      return this.fallbackImage;
    }

    const imagePath = value.trim();

    // Complete Cloudflare R2 / external URL
    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }

    // Angular asset
    if (
      imagePath.startsWith('/assets/') ||
      imagePath.startsWith('assets/')
    ) {
      return imagePath.startsWith('/')
        ? imagePath
        : '/' + imagePath;
    }

    // Backend upload path
    if (
      imagePath.startsWith('/uploads/') ||
      imagePath.startsWith('uploads/')
    ) {
      const normalizedPath =
        imagePath.replace(/^\/+/, '');

      return (
        environment.baseUrl.replace(/\/+$/, '') +
        '/' +
        normalizedPath
      );
    }

    // Filename only
    return (
      this.imageBaseUrl +
      imagePath.replace(/^\/+/, '')
    );
  }

  // =====================================
  // IMAGE ERROR FALLBACK
  // =====================================

  onServiceImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (!image.src.endsWith(this.fallbackImage)) {
      image.src = this.fallbackImage;
    }
  }

  // =====================================
  // BOOK SERVICE
  // =====================================

  bookService(): void {
    if (!this.service?._id) {
      this.toast.error(
        'Service not found',
        'Error'
      );
      return;
    }

    if (!this.service.isActive) {
      this.toast.error(
        'This service is currently unavailable',
        'Service Unavailable'
      );
      return;
    }

    this.toast.success(
      'Redirecting to service booking...',
      'Book Service'
    );

    this.router.navigate([
      '/service-booking',
      this.service._id
    ]);
  }

  // =====================================
  // COMPONENT CLEANUP
  // =====================================

  ngOnDestroy(): void {
    this.serviceSubscription?.unsubscribe();
    this.reviewSubscription?.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
  }
}
