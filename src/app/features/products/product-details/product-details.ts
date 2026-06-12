import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Toast } from '../../../core/services/toast';
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {

  constructor(
  private router: Router,
  private toast: Toast
) {}

buyNow() {
  this.toast.success(
    'Proceeding to checkout...',
    'Buy Now'
  );

  this.router.navigate(['/checkout']);
}

addToCart() {
  this.toast.success(
    'Product added to cart!',
    'Added'
  );

  this.router.navigate(['/cart']);
}

}