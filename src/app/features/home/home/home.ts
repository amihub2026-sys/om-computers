
import { CommonModule } from '@angular/common';

import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import { RouterModule } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent
  implements OnInit, AfterViewInit, OnDestroy {

  // =====================================
  // FEATURED PRODUCTS
  // =====================================

  @ViewChild('productsContainer')
  productsContainer!: ElementRef<HTMLElement>;

  products: Product[] = [];

  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;

  isLoading = true;

  activeCard: number | null = null;

  intervalId: ReturnType<typeof setInterval> | null = null;

  // =====================================
  // FEATURED CATEGORIES
  // =====================================

  categories = [
    {
      name: 'Laptops',
      img: '/assets/images/categories/laptop.png'
    },
    {
      name: 'Desktop PCs',
      img: '/assets/images/categories/desktop.png'
    },
    {
      name: 'Accessories',
      img: '/assets/images/categories/accessories.png'
    },
    {
      name: 'Repair',
      img: '/assets/images/categories/repair.png'
    },
    {
      name: 'Software',
      img: '/assets/images/categories/software.png'
    },
    {
      name: 'Networking',
      img: '/assets/images/categories/network.png'
    },
    {
      name: 'Inverter',
      img: '/assets/images/categories/inverter.png'
    },
    {
      name: 'UPS Battery',
      img: '/assets/images/categories/upsbattery.png'
    }
  ];

  currentIndex = 0;

  itemsPerPage = 4;

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================
  // ON INIT
  // =====================================

  ngOnInit(): void {

    this.updateCategoryLayout();

    this.loadProducts();

  }

  // =====================================
  // LOAD FEATURED PRODUCTS
  // =====================================

  loadProducts(): void {

    this.isLoading = true;

    this.productService.getProducts().subscribe({

      next: (res: any) => {

        this.products = (res.data || []).slice(0, 6);

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(
          'Failed to load featured products:',
          err
        );

        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });

  }

  // =====================================
  // PRODUCT IMAGE URL
  // SUPPORTS CLOUDFLARE R2 + LOCAL
  // =====================================

  getProductImage(image: unknown): string {

    const fallback =
      '/assets/images/products/gaming-pc.jpg';

    if (!image) {
      return fallback;
    }

    const value = Array.isArray(image)
      ? image[0]
      : image;

    if (typeof value !== 'string' || !value.trim()) {
      return fallback;
    }

    const path = value.trim();

    // Full Cloudflare R2 / external URL
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    // Local Angular asset
    if (
      path.startsWith('/assets/') ||
      path.startsWith('assets/')
    ) {
      return path.startsWith('/')
        ? path
        : '/' + path;
    }

    // Backend image
    const base = this.imageBaseUrl.replace(/\/+$/, '');

    // Already contains /uploads/products/
    if (path.startsWith('/uploads/products/')) {
      return (
        environment.baseUrl.replace(/\/+$/, '') +
        path
      );
    }

    if (path.startsWith('uploads/products/')) {
      return (
        environment.baseUrl.replace(/\/+$/, '') +
        '/' +
        path
      );
    }

    // Image filename only
    return base + '/' + path.replace(/^\/+/, '');

  }

  // =====================================
  // IMAGE ERROR FALLBACK
  // =====================================

  onProductImageError(event: Event): void {

    const img = event.target as HTMLImageElement;

    const fallback =
      '/assets/images/products/gaming-pc.jpg';

    if (!img.src.endsWith(fallback)) {
      img.src = fallback;
    }

  }

  // =====================================
  // CATEGORY RESPONSIVE LAYOUT
  // =====================================

  @HostListener('window:resize')
  onWindowResize(): void {

    this.updateCategoryLayout();

  }

  updateCategoryLayout(): void {

    if (typeof window === 'undefined') {
      return;
    }

    const width = window.innerWidth;

    if (width <= 767) {
      this.itemsPerPage = 2;
    } else {
      this.itemsPerPage = 4;
    }

    // Prevent index overflowing after resize
    this.currentIndex = Math.min(
      this.currentIndex,
      this.maxIndex
    );

  }

  // =====================================
  // CATEGORY SLIDER
  // =====================================

  get maxIndex(): number {

    return Math.max(
      0,
      this.categories.length - this.itemsPerPage
    );

  }

  get visibleCategories() {

    return this.categories.slice(
      this.currentIndex,
      this.currentIndex + this.itemsPerPage
    );

  }

  get categoryPages(): number[] {

    return Array.from(
      { length: this.maxIndex + 1 },
      (_, index) => index
    );

  }

  // =====================================
  // NEXT CATEGORY
  // =====================================

  next(): void {

    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }

  }

  // =====================================
  // PREVIOUS CATEGORY
  // =====================================

  prev(): void {

    if (this.currentIndex > 0) {
      this.currentIndex--;
    }

  }

  // =====================================
  // CATEGORY DOT NAVIGATION
  // =====================================

  goToCategory(index: number): void {

    this.currentIndex = Math.max(
      0,
      Math.min(index, this.maxIndex)
    );

  }

  // =====================================
  // AFTER VIEW INIT
  // =====================================

  ngAfterViewInit(): void {

    this.intervalId = setInterval(() => {

      this.autoSlide();

    }, 3000);

  }

  // =====================================
  // FEATURED PRODUCTS AUTO SCROLL
  // =====================================

  autoSlide(): void {

    if (
      !this.productsContainer ||
      this.products.length === 0
    ) {
      return;
    }

    const container =
      this.productsContainer.nativeElement;

    const firstCard =
      container.querySelector<HTMLElement>('.card');

    if (!firstCard) {
      return;
    }

    const styles = window.getComputedStyle(container);

    const gap = parseFloat(
      styles.columnGap || styles.gap || '0'
    ) || 0;

    const cardWidth =
      firstCard.getBoundingClientRect().width + gap;

    const maxScroll =
      container.scrollWidth - container.clientWidth;

    if (maxScroll <= 0) {
      return;
    }

    if (container.scrollLeft + cardWidth >= maxScroll) {

      container.scrollTo({
        left: 0,
        behavior: 'smooth'
      });

    } else {

      container.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      });

    }

  }

  // =====================================
  // TRACK PRODUCTS
  // =====================================

  trackByProduct(
    index: number,
    product: Product
  ): string | undefined {

    return product._id;

  }

  // =====================================
  // DESTROY / CLEANUP
  // =====================================

  ngOnDestroy(): void {

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

  }

}
