import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { environment } from '../../../../environments/environment';

import { CommonSearchBar } from '../../../shared/components/common-search-bar/common-search-bar';
import { CommonPagination } from '../../../shared/components/common-pagination/common-pagination';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommonSearchBar, CommonPagination],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  showFilters = false;

  searchText = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];

  maxPrice = 0;
  priceLimit = 0;
  isLoading = true;

  categories: string[] = [];
  brands: string[] = [];
  products: Product[] = [];
  currentPage = 1;
  pageSize = 6;
  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res.data || [];

        this.categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        this.brands = [...new Set(this.products.map(p => p.brand).filter(Boolean))];

        this.priceLimit = Math.max(...this.products.map(p => p.price || 0), 0);
        this.maxPrice = this.priceLimit;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFilter(list: string[], value: string): void {
    const index = list.indexOf(value);
    index > -1 ? list.splice(index, 1) : list.push(value);
  }

  get filteredProducts(): Product[] {
    const search = this.searchText.toLowerCase().trim();

    return this.products.filter(product => {
      const searchMatch =
        !search ||
        product.name?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search);

      const categoryMatch =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(product.category);

      const brandMatch =
        this.selectedBrands.length === 0 ||
        this.selectedBrands.includes(product.brand);

      const priceMatch =
        this.maxPrice === 0 || product.price <= this.maxPrice;

      return searchMatch && categoryMatch && brandMatch && priceMatch;
    });
  }
  get paginatedProducts(): Product[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredProducts.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.filteredProducts.length / this.pageSize);
}

changePage(page: number): void {
  this.currentPage = page;
}
  trackByProduct(index: number, product: Product): string | undefined {
    return product._id;
  }

  openFilters(): void {
    this.showFilters = true;
    document.body.style.overflow = 'hidden';
  }

  closeFilters(): void {
    this.showFilters = false;
    document.body.style.overflow = '';
  }

  applyFilters(): void {
    this.closeFilters();
  }

  resetFilters(): void {
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.maxPrice = this.priceLimit;
    this.searchText = '';
    this.closeFilters();
  }
}