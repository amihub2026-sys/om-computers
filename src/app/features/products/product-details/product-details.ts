import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {

  constructor(private router: Router) {}

  buyNow() {
    // Later you can add checkout logic here
    this.router.navigate(['/checkout']);
  }

  addToCart() {
    // Later you can save the product to the cart here
    this.router.navigate(['/cart']);
  }

}