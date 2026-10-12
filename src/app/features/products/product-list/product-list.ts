
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { Cart } from '../../../core/services/cart';
import { Toast } from '../../../core/services/toast';

import { CommonSearchBar } from '../../../shared/components/common-search-bar/common-search-bar';
import { CommonPagination } from '../../../shared/components/common-pagination/common-pagination';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CommonSearchBar,
    CommonPagination
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit, OnDestroy {

  // PRODUCT LOADING
  isLoading = true;
  products: Product[] = [];

  // FILTERS
  showFilters = false;
  searchText = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  categories: string[] = [];
  brands: string[] = [];
  maxPrice = 0;
  priceLimit = 0;

  // PAGINATION
  currentPage = 1;
  pageSize = 12;

  // CART STATE
  cartItemIds = new Map<string, string>();
  addingProductId: string | null = null;
  cartStatusLoading = true;

  private readonly destroy$ = new Subject<void>();
  private cartRequestVersion = 0;
  private cartMutationVersion = 0;
  private destroyed = false;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private cart: Cart,
    private toast: Toast
  ) {}

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {
    this.loadProducts();
    this.loadCartStatus();

    window.addEventListener(
      'cart-updated',
      this.onCartUpdated
    );

    window.addEventListener(
      'auth-changed',
      this.onAuthChanged
    );
  }

  private readonly onCartUpdated = () => {
    this.loadCartStatus();
  };

  private readonly onAuthChanged = () => {
    this.loadCartStatus();
  };

  // =====================================
  // LOAD PRODUCTS
  // =====================================

  loadProducts(): void {
    this.isLoading = true;

    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.products = Array.isArray(res?.data)
            ? res.data
            : [];

          this.categories = [
            ...new Set(
              this.products
                .map(p => p.category)
                .filter((v): v is string =>
                  typeof v === 'string' && !!v
                )
            )
          ];

          this.brands = [
            ...new Set(
              this.products
                .map(p => p.brand)
                .filter((v): v is string =>
                  typeof v === 'string' && !!v
                )
            )
          ];

          this.priceLimit = Math.max(
            0,
            ...this.products.map(
              p => Number(p.price) || 0
            )
          );

          this.maxPrice = this.priceLimit;
          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Product loading failed:', err);
          this.products = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // =====================================
  // LOAD CUSTOMER CART FROM MONGODB
  // =====================================

  loadCartStatus(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    const requestVersion = ++this.cartRequestVersion;
    const mutationVersion = this.cartMutationVersion;

    if (!token || !user) {
      this.cartItemIds = new Map();
      this.cartStatusLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.cartStatusLoading = true;
    this.cdr.detectChanges();

    this.cart.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (
            this.destroyed ||
            requestVersion !== this.cartRequestVersion ||
            mutationVersion !== this.cartMutationVersion ||
            localStorage.getItem('token') !== token
          ) {
            return;
          }

          if (!res?.success || !Array.isArray(res.data)) {
            this.cartStatusLoading = false;
            this.toast.error(
              'Unable to load cart status.',
              'Cart'
            );
            this.cdr.detectChanges();
            return;
          }

          const mapping = new Map<string, string>();

          for (const item of res.data) {
            const productId =
              item.productId &&
              typeof item.productId === 'object'
                ? item.productId._id
                : item.productId;

            if (productId && item._id) {
              mapping.set(
                String(productId),
                String(item._id)
              );
            }
          }

          this.cartItemIds = mapping;
          this.cartStatusLoading = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          if (
            requestVersion !== this.cartRequestVersion ||
            mutationVersion !== this.cartMutationVersion ||
            localStorage.getItem('token') !== token
          ) {
            return;
          }

          if (err?.status === 401) {
            this.cartItemIds = new Map();
          }

          this.cartStatusLoading = false;
          this.toast.error(
            'Could not refresh your cart.',
            'Cart'
          );
          this.cdr.detectChanges();
        }
      });
  }

  // =====================================
  // ADD OR REMOVE PRODUCT
  // =====================================

  addToCart(product: Product): void {
    if (!product?._id) {
      this.toast.error('Product not found', 'Error');
      return;
    }

    const productId = String(product._id);
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      window.dispatchEvent(new Event('login-required'));
      return;
    }

    // Wait until existing cart has been loaded.
    if (this.cartStatusLoading || this.addingProductId) {
      return;
    }

    // Product already exists in cart.
    const cartItemId = this.cartItemIds.get(productId);

    if (cartItemId) {
      this.removeProduct(productId, cartItemId, token);
      return;
    }

    // Otherwise add the product.
    let customer: any;

    try {
      customer = JSON.parse(savedUser);
    } catch {
      window.dispatchEvent(new Event('login-required'));
      return;
    }

    this.addingProductId = productId;
    this.cartMutationVersion++;
    this.cdr.detectChanges();

    const price = Number(product.price) || 0;

    const cartData = {
      customerName: customer?.name || 'Customer',
      phone: customer?.phone || '',
      productId,
      productName: product.name,
      image: product.image || '',
      price,
      quantity: 1,
      total: price
    };

    this.cart.addToCart(cartData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.addingProductId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          if (!res?.success) {
            this.toast.error(
              res?.message || 'Failed to add product.',
              'Error'
            );
            return;
          }

          if (localStorage.getItem('token') !== token) {
            this.loadCartStatus();
            return;
          }

          const newCartItemId = res?.data?._id;

          if (newCartItemId) {
            this.cartItemIds = new Map(this.cartItemIds);
            this.cartItemIds.set(
              productId,
              String(newCartItemId)
            );
          }

          this.toast.success(
            'Product added to cart!',
            'Added'
          );

          window.dispatchEvent(new Event('cart-updated'));
          this.cdr.detectChanges();
        },

        error: (err) => {
          if (err?.status === 401) {
            this.toast.error(
              'Please sign in again.',
              'Session Expired'
            );
          } else {
            this.toast.error(
              'Failed to add product to cart.',
              'Error'
            );
          }
        }
      });
  }

  // =====================================
  // REMOVE ENTIRE CART ENTRY
  // =====================================

  private removeProduct(
    productId: string,
    cartItemId: string,
    token: string
  ): void {
    this.addingProductId = productId;
    this.cartMutationVersion++;
    this.cdr.detectChanges();

    this.cart.deleteCartItem(cartItemId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.addingProductId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          if (!res?.success) {
            this.toast.error(
              res?.message || 'Failed to remove product.',
              'Error'
            );
            return;
          }

          if (localStorage.getItem('token') !== token) {
            this.loadCartStatus();
            return;
          }

          const mapping = new Map(this.cartItemIds);
          mapping.delete(productId);
          this.cartItemIds = mapping;

          this.toast.success(
            'Product removed from cart!',
            'Removed'
          );

          window.dispatchEvent(new Event('cart-updated'));
          this.cdr.detectChanges();
        },

        error: (err) => {
          if (err?.status === 401) {
            this.toast.error(
              'Please sign in again.',
              'Session Expired'
            );
          } else {
            this.toast.error(
              'Failed to remove product.',
              'Error'
            );
          }
        }
      });
  }

  // =====================================
  // IMAGE FALLBACK
  // =====================================

  onProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.src = 'assets/images/products/gaming-pc.jpg';
  }

  // =====================================
  // FILTERING
  // =====================================

  toggleFilter(list: string[], value: string): void {
    const index = list.indexOf(value);

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }

    this.currentPage = 1;
  }

  get filteredProducts(): Product[] {
    const search = this.searchText.toLowerCase().trim();

    return this.products.filter(product => {
      const searchMatch =
        !search ||
        (product.name || '').toLowerCase().includes(search) ||
        (product.description || '').toLowerCase().includes(search) ||
        (product.category || '').toLowerCase().includes(search) ||
        (product.brand || '').toLowerCase().includes(search);

      const categoryMatch =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(product.category);

      const brandMatch =
        this.selectedBrands.length === 0 ||
        this.selectedBrands.includes(product.brand);

      const priceMatch =
        this.maxPrice === 0 ||
        Number(product.price) <= this.maxPrice;

      return Boolean(
        searchMatch && categoryMatch &&
        brandMatch && priceMatch
      );
    });
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredProducts.slice(
      start,
      start + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.ceil(
      this.filteredProducts.length / this.pageSize
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  trackByProduct(index: number, product: Product): string | undefined {
    return product._id;
  }

  // =====================================
  // MOBILE FILTERS
  // =====================================

  openFilters(): void {
    this.showFilters = true;
    document.body.style.overflow = 'hidden';
  }

  closeFilters(): void {
    this.showFilters = false;
    document.body.style.overflow = '';
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.closeFilters();
  }

  resetFilters(): void {
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.maxPrice = this.priceLimit;
    this.searchText = '';
    this.currentPage = 1;
    this.closeFilters();
  }

  // =====================================
  // CLEANUP
  // =====================================

  ngOnDestroy(): void {
    this.destroyed = true;
    document.body.style.overflow = '';

    window.removeEventListener(
      'cart-updated',
      this.onCartUpdated
    );

    window.removeEventListener(
      'auth-changed',
      this.onAuthChanged
    );

    this.destroy$.next();
    this.destroy$.complete();
  }
}

