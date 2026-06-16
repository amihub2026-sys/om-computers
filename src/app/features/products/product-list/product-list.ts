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

export class ProductList {
  constructor(private toast: Toast) {}

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

  selectedProcessors: string[] = [];
  maxPrice = 150000;
  categories = ['Laptops', 'Desktops', 'Gaming PCs', 'Monitors', 'Accessories'];
  brands = ['TechConnect', 'Apple', 'Dell', 'Lenovo'];
  processors = ['i5', 'i7', 'i9', 'Ryzen'];


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
  toggleFilter(list: string[], value: string) {
    const index = list.indexOf(value);
    index > -1 ? list.splice(index, 1) : list.push(value);
  }

  get filteredProducts() {
    return this.products.filter(product => {
      const searchMatch = product.name?.toLowerCase().includes(this.searchText.toLowerCase());

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
  trackByProduct(index: number, product: Product) {
  return product._id;
}
openFilters() {
  this.showFilters = true;
  document.body.style.overflow = 'hidden';
}

closeFilters() {
  this.showFilters = false;
  document.body.style.overflow = '';
}
applyFilters() {
  this.showFilters = false;
}

resetFilters() {
  this.selectedCategories = [];
  this.selectedBrands = [];
  this.selectedProcessors = [];
  this.maxPrice = 150000;
  this.searchText = '';
  this.showFilters = false;
}
}




