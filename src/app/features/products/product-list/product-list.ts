import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

        this.priceLimit = Math.max(...this.products.map(p => p.price || 0));
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
    return this.products.filter(product => {
      const searchMatch =
        product.name?.toLowerCase().includes(this.searchText.toLowerCase());

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
    this.showFilters = false;
    document.body.style.overflow = '';
  }

  resetFilters(): void {
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.maxPrice = this.priceLimit;
    this.searchText = '';
    this.showFilters = false;
    document.body.style.overflow = '';
  }
}