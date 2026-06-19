import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { environment } from '../../../environments/environment';
import { CommonPagination } from '../../shared/components/common-pagination/common-pagination';
@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [RouterModule, CommonModule, CommonPagination],
  templateUrl: './manage-products.html',
  styleUrl: './manage-products.css',
})
export class ManageProducts implements OnInit {
  products: any[] = [];
  currentPage = 1;
  pageSize = 10;
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
   
  get paginatedProducts(): any[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.products.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.products.length / this.pageSize);
}

changePage(page: number): void {
  this.currentPage = page;
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