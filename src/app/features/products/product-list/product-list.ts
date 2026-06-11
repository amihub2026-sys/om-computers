import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  searchText = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedProcessors: string[] = [];
  maxPrice = 150000;

  categories = ['Laptops', 'Desktops', 'Gaming PCs', 'Monitors', 'Accessories'];
  brands = ['TechConnect', 'Apple', 'Dell', 'Lenovo'];
  processors = ['i5', 'i7', 'i9', 'Ryzen'];

  products = [
    {
      name: 'TechConnect Pro 15"',
      category: 'Laptops',
      brand: 'TechConnect',
      processor: 'i7',
      price: 55000,
      oldPrice: 85000,
      image: 'assets/images/products/gaming-pc.jpg',
      badge: 'New Arrival',
      specs: ['Intel Core i7', '16GB RAM', '512GB SSD']
    },
    {
      name: 'Gaming Desktop',
      category: 'Gaming PCs',
      brand: 'Dell',
      processor: 'i9',
      price: 95000,
      oldPrice: 110000,
      image: 'assets/images/products/gaming-pc.jpg',
      badge: 'Sale',
      specs: ['Intel Core i9', '32GB RAM', '1TB SSD']
    },
    {
      name: 'RGB Gaming Tower',
      category: 'Desktops',
      brand: 'Lenovo',
      processor: 'Ryzen',
      price: 125000,
      oldPrice: 150000,
      image: 'assets/images/products/gaming-pc.jpg',
      badge: '',
      specs: ['Ryzen 9', '64GB RAM', '2TB SSD']
    }
  ];

  toggleFilter(list: string[], value: string) {
    const index = list.indexOf(value);
    index > -1 ? list.splice(index, 1) : list.push(value);
  }

  get filteredProducts() {
    return this.products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(this.searchText.toLowerCase());

      const categoryMatch =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(product.category);

      const brandMatch =
        this.selectedBrands.length === 0 ||
        this.selectedBrands.includes(product.brand);

      const processorMatch =
        this.selectedProcessors.length === 0 ||
        this.selectedProcessors.includes(product.processor);

      const priceMatch = product.price <= this.maxPrice;

      return searchMatch && categoryMatch && brandMatch && processorMatch && priceMatch;
    });
  }
}