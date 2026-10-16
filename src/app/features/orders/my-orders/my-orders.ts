
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Subject,
  forkJoin,
  of,
  catchError,
  takeUntil
} from 'rxjs';

import { Order as OrderService } from '../../../core/services/order';
import { BookingService } from '../../../core/services/booking.service';
import { ServiceService } from '../../../core/services/service.service';
import {
  ReviewService,
  ReviewItem
} from '../../../core/services/review.service';

import { Toast } from '../../../core/services/toast';

import { OrderItem } from '../../../core/interfaces/order.interface';
import { Booking } from '../../../core/interfaces/booking.interface';

import { ReviewForm } from '../../../shared/components/review-form/review-form';

import { environment } from '../../../../environments/environment';

type OrderTab = 'all' | 'products' | 'services';
type HistoryType = 'product' | 'service';

interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  subtitle: string;
  date: Date | null;
  status: string;
  amount: number | null;
  quantity: number | null;
  image: string;
  detailLink: string[];

  productId?: string;
  canReview: boolean;
  
imageFailed?: boolean;


}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReviewForm
  ],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit, OnDestroy {
  
onHistoryImageError(item: HistoryItem): void {
  item.imageFailed = true;
  this.cdr.detectChanges();
}


  activeTab: OrderTab = 'all';

  orders: OrderItem[] = [];
  bookings: Booking[] = [];
  history: HistoryItem[] = [];

  isLoading = false;
  hasError = false;

  myReviews: ReviewItem[] = [];
  selectedReviewItem: HistoryItem | null = null;


selectedExistingReview: ReviewItem | null = null;

getExistingReview(item: HistoryItem): ReviewItem | null {
  return this.myReviews.find(review => {

    if (item.type === 'service') {
      return review.reviewType === 'service' &&
        String(review.bookingId) === item.id;
    }

    return review.reviewType === 'product' &&
      String(review.orderId) === item.id &&
      String(review.productId) === item.productId;

  }) || null;
}

openEditReview(item: HistoryItem): void {
  const review = this.getExistingReview(item);

  if (!review) {
    this.toast.error('Review not found', 'Error');
    return;
  }

  this.selectedExistingReview = review;
  this.selectedReviewItem = item;
  this.cdr.detectChanges();
}


  readonly productFallback = '';

  serviceImages = new Map<string, string>();

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private bookingService: BookingService,
    private serviceService: ServiceService,
    private reviewService: ReviewService,
    private toast: Toast,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    this.loadMyReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // LOAD PRODUCT ORDERS, BOOKINGS AND SERVICES
  // ==========================================

  loadHistory(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.detectChanges();

    forkJoin({
      orders: this.orderService.getOrders().pipe(
        catchError(error => {
          console.error('Product orders error:', error);
          return of(null);
        })
      ),

      bookings: this.bookingService.getBookings().pipe(
        catchError(error => {
          console.error('Service bookings error:', error);
          return of(null);
        })
      ),

      services: this.serviceService.getServices().pipe(
        catchError(error => {
          console.error('Services loading error:', error);
          return of(null);
        })
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ orders, bookings, services }) => {

          this.orders =
            orders?.success && Array.isArray(orders.data)
              ? orders.data
              : [];

          this.bookings =
            bookings?.success && Array.isArray(bookings.data)
              ? bookings.data
              : [];

          this.hasError =
            (!orders || !orders.success) &&
            (!bookings || !bookings.success);

          // ==================================
          // BUILD SERVICE IMAGE LOOKUP
          // ==================================

          this.serviceImages = new Map<string, string>();

          if (
            services?.success &&
            Array.isArray(services.data)
          ) {
            for (const service of services.data) {

              if (service._id && service.image) {
                this.serviceImages.set(
                  String(service._id),
                  this.getServiceImage(service.image)
                );
              }

            }
          }

          // ==================================
          // BUILD COMBINED ORDER HISTORY
          // ==================================

          this.buildHistory();

          this.isLoading = false;

          if (this.hasError) {
            this.toast.error(
              'Unable to load your order history.',
              'Error'
            );
          }

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(
            'History loading failed:',
            error
          );

          this.isLoading = false;
          this.hasError = true;

          this.orders = [];
          this.bookings = [];
          this.history = [];

          this.toast.error(
            'Failed to load order history.',
            'Error'
          );

          this.cdr.detectChanges();
        }
      });
  }

  // ==========================================
  // COMBINE PRODUCTS AND SERVICES
  // ==========================================

  private buildHistory(): void {

    const productHistory: HistoryItem[] =
      this.orders.map(order => {

        const products = order.products || [];
        const firstProduct = products[0];

        const quantity = products.reduce(
          (total, product) =>
            total + Number(product.quantity || 0),
          0
        );

        return {
          id: order._id,
          type: 'product',

          title:
            firstProduct?.productName ||
            'Product Order',

          subtitle:
            products.length > 1
              ? `+${products.length - 1} more product(s)`
              : 'Product Purchase',

          date: this.parseDate(order.createdAt),

          status: order.orderStatus || 'Pending',

          amount: Number(order.totalAmount || 0),
          quantity,

          image: this.getProductImage(
            firstProduct?.image
          ),

          detailLink: [
            '/my-orders',
            order._id
          ],

          productId: firstProduct?.productId
            ? String(firstProduct.productId)
            : '',

          canReview:
            (order.orderStatus || '').toLowerCase() ===
            'delivered'
        };
      });

    const serviceHistory: HistoryItem[] =
      this.bookings.map(booking => {

        const record = booking as Booking & {
          createdAt?: string;
          serviceId?: string | {
            _id?: string;
          };
        };

        const serviceId =
          typeof record.serviceId === 'string'
            ? record.serviceId
            : record.serviceId?._id || '';

        return {
          id: booking._id,
          type: 'service',

          title:
            booking.serviceName ||
            'Service Booking',

          subtitle: 'Service Request',

          date: this.parseDate(
            record.createdAt ||
            booking.bookingDate
          ),

          status: booking.status || 'Pending',

          amount: null,
          quantity: null,

          // Actual service image when available.
          // Empty string keeps wrench fallback.
          image: serviceId
            ? this.serviceImages.get(serviceId) || ''
            : '',

          detailLink: [
            '/my-bookings',
            booking._id
          ],

          productId: '',

          canReview:
            (booking.status || '').toLowerCase() ===
            'completed'
        };
      });

    this.history = [
      ...productHistory,
      ...serviceHistory
    ].sort(
      (a, b) =>
        (b.date?.getTime() || 0) -
        (a.date?.getTime() || 0)
    );
  }

  // ==========================================
  // PRODUCT IMAGE URL
  // ==========================================

  getProductImage(image?: string): string {

    if (!image?.trim()) {
      return this.productFallback;
    }

    const path = image.trim();

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    if (path.startsWith('/assets/')) {
      return path;
    }

    if (path.startsWith('assets/')) {
      return '/' + path;
    }

    const base =
      environment.baseUrl.replace(/\/+$/, '');

    if (path.startsWith('/uploads/')) {
      return base + path;
    }

    if (path.startsWith('uploads/')) {
      return base + '/' + path;
    }

    return (
      base +
      '/uploads/products/' +
      path.replace(/^\/+/, '')
    );
  }

  // ==========================================
  // SERVICE IMAGE URL
  // CLOUDFLARE R2 + LOCAL UPLOAD SUPPORT
  // ==========================================

  getServiceImage(image?: string): string {

    if (!image?.trim()) {
      return '';
    }

    const path = image.trim();

    // Cloudflare R2 or external image
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    // Angular local assets
    if (path.startsWith('/assets/')) {
      return path;
    }

    if (path.startsWith('assets/')) {
      return '/' + path;
    }

    const base =
      environment.baseUrl.replace(/\/+$/, '');

    // Backend local uploads
    if (path.startsWith('/uploads/')) {
      return base + path;
    }

    if (path.startsWith('uploads/')) {
      return base + '/' + path;
    }

    // Filename only
    return (
      base +
      '/uploads/services/' +
      path.replace(/^\/+/, '')
    );
  }

  // ==========================================
  // IMAGE ERROR
  // ==========================================

  onImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    image.onerror = null;
    image.style.display = 'none';

    // Hide the broken image.
    // The HTML should show the fallback symbol
    // when the image cannot be loaded.
  }

  // ==========================================
  // DATE PARSING
  // ==========================================

  private parseDate(
    value: string | Date | undefined | null
  ): Date | null {

    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  // ==========================================
  // TABS
  // ==========================================

  setTab(tab: OrderTab): void {
    this.activeTab = tab;
  }

  get filteredHistory(): HistoryItem[] {

    if (this.activeTab === 'products') {
      return this.history.filter(
        item => item.type === 'product'
      );
    }

    if (this.activeTab === 'services') {
      return this.history.filter(
        item => item.type === 'service'
      );
    }

    return this.history;
  }

  get productCount(): number {
    return this.history.filter(
      item => item.type === 'product'
    ).length;
  }

  get serviceCount(): number {
    return this.history.filter(
      item => item.type === 'service'
    ).length;
  }

  // ==========================================
  // REVIEWS
  // ==========================================

  loadMyReviews(): void {

    this.reviewService.getMyReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: response => {
          this.myReviews =
            response.success &&
            Array.isArray(response.data)
              ? response.data
              : [];

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(
            'Failed to load reviews:',
            error
          );

          this.myReviews = [];
          this.cdr.detectChanges();
        }
      });
  }

  hasReviewed(item: HistoryItem): boolean {

    return this.myReviews.some(review => {

      if (item.type === 'service') {
        return (
          review.reviewType === 'service' &&
          review.bookingId === item.id
        );
      }

      return (
        review.reviewType === 'product' &&
        review.orderId === item.id &&
        review.productId === item.productId
      );
    });
  }

  openReview(item: HistoryItem): void {

    if (!item.canReview) {
      return;
    }

    if (this.hasReviewed(item)) {
      this.toast.error(
        'You have already reviewed this order.',
        'Review Exists'
      );
      return;
    }

    if (
      item.type === 'product' &&
      !item.productId
    ) {
      this.toast.error(
        'Product ID is unavailable for this order.',
        'Review Unavailable'
      );
      return;
    }
this.selectedExistingReview = null;
    this.selectedReviewItem = item;
    this.cdr.detectChanges();
  }

  closeReview(): void {
    this.selectedReviewItem = null;
    this.cdr.detectChanges();
  }

  onReviewSubmitted(): void {

    this.selectedReviewItem = null;

    this.toast.success(
      'Review submitted successfully!',
      'Thank You'
    );

    this.loadMyReviews();
    this.cdr.detectChanges();
  }

  // ==========================================
  // STATUS COLORS
  // ==========================================

  getStatusClass(status: string): string {

    switch ((status || '').toLowerCase()) {

      case 'delivered':
      case 'completed':
        return 'status-success';

      case 'confirmed':
      case 'shipped':
      case 'in progress':
      case 'scheduled':
        return 'status-progress';

      case 'cancelled':
      case 'failed':
        return 'status-cancelled';

      default:
        return 'status-pending';
    }
  }

  trackByHistoryId(
    index: number,
    item: HistoryItem
  ): string {
    return `${item.type}-${item.id}`;
  }
}
