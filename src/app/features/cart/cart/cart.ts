import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../core/services/alert';
import { Toast } from '../../../core/services/toast';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
constructor(
  private alert: AlertService,
  private toast: Toast
) {}
  quantity1 = 1;
  quantity2 = 1;

  increase(item: number) {
    if (item === 1) {
      this.quantity1++;
    } else {
      this.quantity2++;
    }
  }

  decrease(item: number) {
    if (item === 1 && this.quantity1 > 1) {
      this.quantity1--;
    } else if (item === 2 && this.quantity2 > 1) {
      this.quantity2--;
    }
  }

showItem1 = true;
showItem2 = true;

removeItem(item: number) {
  this.alert.confirm(
    'Remove Item?',
    'Are you sure you want to remove this item from the cart?',
    'Remove',
    'Cancel'
  ).then((result) => {

    if (result.isConfirmed) {
      if (item === 1) {
        this.showItem1 = false;
      } else {
        this.showItem2 = false;
      }

      this.toast.success(
        'Item removed from cart.',
        'Removed'
      );
    }

  });
}
}