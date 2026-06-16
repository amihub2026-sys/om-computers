import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Toast } from '../../../core/services/toast';
import { Cart } from '../../../core/services/cart';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {

  product?: Product;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast,
    private cart: Cart,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  console.log('PRODUCT ID:', id);

  if (!id) {
    this.router.navigate(['/products']);
    return;
  }

  this.productService.getProductById(id).subscribe({
    next: (res: any) => {
      console.log('PRODUCT RESPONSE:', res);

      this.product = res.data || res;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.log('PRODUCT ERROR:', err);

      this.isLoading = false;
      this.cdr.detectChanges();
      this.toast.error('Product not found', 'Error');
      this.router.navigate(['/products']);
    }
  });
}

get productImage(): string {
  return this.product?.image
    ? 'https://om-computers-backend.onrender.com/uploads/products/' + this.product.image
    : 'assets/images/products/gaming-pc.jpg';
}

  buyNow(): void {
    this.toast.success('Proceeding to checkout...', 'Buy Now');
    this.router.navigate(['/checkout']);
  }

  addToCart(): void {
    this.toast.success('Product added to cart!', 'Added');
    this.router.navigate(['/cart']);
  }
}