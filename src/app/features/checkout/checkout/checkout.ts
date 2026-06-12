import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {

  constructor(
  private router: Router,
  private toast: Toast
) {}

placeOrder() {

  this.toast.success(
    'Order placed successfully!',
    'Success'
  );

  this.router.navigate(['/order-success']);

}

}