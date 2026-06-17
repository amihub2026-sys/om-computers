import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-products.html',
  styleUrl: './manage-products.css',
})
export class ManageProducts implements OnInit {
  products: any[] = [];
  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res.data || [];
        console.log('ADMIN PRODUCTS:', this.products);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }
  deleteProduct(id: string) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  this.productService.deleteProduct(id).subscribe({
    next: () => {
      alert('Product deleted successfully');
      this.loadProducts();
    },
    error: (err) => {
      console.error(err);
      alert('Delete failed');
    }
  });
}
}