import { Component } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {

  constructor(private router: Router) {}

  placeOrder() {
    // Later you can save the order to the database here
    this.router.navigate(['/order-success']);
  }

}