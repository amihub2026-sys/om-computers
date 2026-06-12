import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {

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
  if (item === 1) {
    this.showItem1 = false;
  } else {
    this.showItem2 = false;
  }
}
}