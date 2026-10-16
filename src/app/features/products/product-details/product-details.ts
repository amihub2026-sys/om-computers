
import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import { Subscription } from 'rxjs';

import { Toast } from '../../../core/services/toast';
import { Cart } from '../../../core/services/cart';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';

import {
  ReviewService,
  ReviewItem
} from '../../../core/services/review.service';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit, OnDestroy {

  // =====================================
  // PRODUCT DATA
  // =====================================

  product?: Product;

  isLoading = true;
  isAddingToCart = false;

  private routeSubscription?: Subscription;
  private productSubscription?: Subscription;
  private reviewSubscription?: Subscription;

  // =====================================
  // IMAGE CONFIGURATION
  // =====================================

  readonly fallbackImage =
    '/assets/images/products/gaming-pc.jpg';

  readonly imageBaseUrl =
    `${environment.baseUrl.replace(/\/+$/, '')}/uploads/products/`;

  // =====================================
  // CUSTOMER REVIEWS
  // =====================================

  reviews: ReviewItem[] = [];

  isReviewsLoading = false;
  reviewsError = '';

  visibleReviewCount = 3;

  readonly reviewsPerPage = 3;
  readonly stars = [1, 2, 3, 4, 5];

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast,
    private cart: Cart,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.routeSubscription = this.route.paramMap.subscribe(
      params => {

        const productId = params.get('id');

        if (!productId) {

          this.toast.error(
            'Invalid product link',
            'Error'
          );

          this.router.navigate(['/products']);
          return;
        }

        this.loadProduct(productId);

        // Load only reviews of this product
        this.loadProductReviews(productId);

      }
    );

  }

  // =====================================
  // LOAD PRODUCT
  // =====================================

  loadProduct(productId: string): void {

    this.productSubscription?.unsubscribe();

    this.product = undefined;
    this.isLoading = true;

    this.productSubscription =
      this.productService.getProductById(productId)
        .subscribe({

          next: (response: any) => {

            const productData =
              response?.data ?? response;

            if (
              !productData ||
              !productData._id
            ) {

              this.isLoading = false;

              this.toast.error(
                'Product not found',
                'Error'
              );

              this.router.navigate(['/products']);
              return;
            }

            this.product = productData as Product;
            this.isLoading = false;

            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              'Failed to load product:',
              error
            );

            this.isLoading = false;

            this.toast.error(
              'Unable to load product details',
              'Error'
            );

            this.cdr.detectChanges();

            this.router.navigate(['/products']);

          }

        });

  }

  // =====================================
  // LOAD APPROVED PRODUCT REVIEWS
  // =====================================

  loadProductReviews(productId: string): void {

    this.reviewSubscription?.unsubscribe();

    this.reviews = [];
    this.reviewsError = '';
    this.isReviewsLoading = true;
    this.visibleReviewCount = 3;

    this.reviewSubscription =
      this.reviewService
        .getPublicReviews('product', productId)
        .subscribe({

          next: (response) => {

            this.reviews =
              response.success &&
              Array.isArray(response.data)
                ? response.data
                    .filter(review =>
                      review.reviewType === 'product' &&
                      (
                        typeof review.productId === 'string'
                          ? review.productId === productId
                          : !!review.productId &&
                            String(
                              (review.productId as any)._id
                            ) === productId
                      )
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                : [];

            this.isReviewsLoading = false;

            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              'Failed to load product reviews:',
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

  get averageRating(): number {

    if (!this.reviews.length) {
      return 0;
    }

    const total = this.reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return total / this.reviews.length;

  }

  get formattedAverageRating(): string {

    return this.averageRating.toFixed(1);

  }

  get totalReviews(): number {

    return this.reviews.length;

  }

  // =====================================
  // RATING DISTRIBUTION
  // =====================================

  getRatingCount(rating: number): number {

    return this.reviews.filter(
      review => review.rating === rating
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

  // =====================================
  // STAR DISPLAY
  // =====================================

  isStarFilled(
    star: number,
    rating: number
  ): boolean {

    return star <= Math.round(rating);

  }

  // =====================================
  // CUSTOMER NAME
  // =====================================

  getReviewerName(review: ReviewItem): string {

    const user = review.userId as unknown;

    if (
      user &&
      typeof user === 'object'
    ) {

      const customer = user as {
        name?: string;
        email?: string;
      };

      if (customer.name?.trim()) {
        return customer.name;
      }

    }

    return 'Verified Customer';

  }

  // =====================================
  // VISIBLE REVIEWS
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
  // REVIEW IMAGE
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
  // PRODUCT IMAGE
  // =====================================

  get productImage(): string {

    return this.getProductImage(
      this.product?.image
    );

  }

  getProductImage(image: unknown): string {

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

    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }

    if (
      imagePath.startsWith('/assets/') ||
      imagePath.startsWith('assets/')
    ) {

      return imagePath.startsWith('/')
        ? imagePath
        : '/' + imagePath;

    }

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

    return (
      this.imageBaseUrl +
      imagePath.replace(/^\/+/, '')
    );

  }

  // =====================================
  // IMAGE LOAD ERROR
  // =====================================

  onImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    if (!image.src.endsWith(this.fallbackImage)) {
      image.src = this.fallbackImage;
    }

  }

  // =====================================
  // BACK TO PRODUCTS
  // =====================================

  goBackToProducts(): void {

    this.router.navigate(['/products']);

  }

  // =====================================
  // BUY NOW
  // =====================================

  buyNow(): void {

    if (!this.product) {

      this.toast.error(
        'Product not found',
        'Error'
      );

      return;
    }

    this.router.navigate(
      ['/checkout'],
      {
        queryParams: {
          productId: this.product._id
        }
      }
    );

  }

  // =====================================
  // ADD TO CART
  // =====================================

  addToCart(): void {

    if (!this.product) {

      this.toast.error(
        'Product not found',
        'Error'
      );

      return;
    }

    if (this.isAddingToCart) {
      return;
    }

    const product = this.product;

    const price = Number(
      product.price || 0
    );

    const cartData = {

      customerName:
        localStorage.getItem('name') ||
        'Customer',

      phone:
        localStorage.getItem('phone') ||
        '0000000000',

      productId: product._id,

      productName: product.name,

      image: product.image || '',

      price,

      quantity: 1,

      total: price

    };

    this.isAddingToCart = true;

    this.cart.addToCart(cartData).subscribe({

      next: (response: any) => {

        this.isAddingToCart = false;

        if (response?.success) {

          this.toast.success(
            'Product added to cart!',
            'Added'
          );

          this.router.navigate(['/cart']);

        } else {

          this.toast.error(
            response?.message ||
            'Unable to add product',
            'Error'
          );

        }

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Add to cart failed:',
          error
        );

        this.isAddingToCart = false;

        this.toast.error(
          'Failed to add product to cart.',
          'Error'
        );

        this.cdr.detectChanges();

      }

    });

  }

  // =====================================
  // CLEANUP
  // =====================================

  ngOnDestroy(): void {

    this.routeSubscription?.unsubscribe();

    this.productSubscription?.unsubscribe();

    this.reviewSubscription?.unsubscribe();

  }

}
