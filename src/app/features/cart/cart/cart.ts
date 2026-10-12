import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AlertService } from '../../../core/services/alert';
import { Toast } from '../../../core/services/toast';

import { Cart as CartService } from '../../../core/services/cart';
import { CartItem, UpdateCartRequest } from '../../../core/interfaces/cart.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  isLoading = false;
  updatingItemId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private alert: AlertService,
    private toast: Toast,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    this.cartItems = [];
    this.isLoading = false;
    return;
  }

  this.getCartItems();
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
getCartItems(): void {

  // Never show a customer's cart after logout
  const token = localStorage.getItem('token');

  if (!token) {
    this.cartItems = [];
    this.isLoading = false;
    this.cdr.detectChanges();
    return;
  }

  this.isLoading = true;
  this.cdr.detectChanges();

  this.cartService.getCartItems()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {

        this.isLoading = false;

        // Prevent an in-flight request from restoring
        // cart items after the customer logs out
        if (!localStorage.getItem('token')) {
          this.cartItems = [];
          this.cdr.detectChanges();
          return;
        }

        this.cartItems = res.success
          ? (res.data || [])
          : [];

        this.cdr.detectChanges();
      },

      error: () => {
        this.isLoading = false;
        this.cartItems = [];
        this.cdr.detectChanges();
      }
    });
}


  get subtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  }

  increase(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    this.updateQuantity(item, item.quantity - 1);
  }

  updateQuantity(item: CartItem, quantity: number): void {

    if (!localStorage.getItem('token')) {
  this.cartItems = [];
  this.toast.error(
    'Please sign in to update your cart.',
    'Login Required'
  );
  return;
}
    this.updatingItemId = item._id;

    const total = Number(item.price) * quantity;

    const data: UpdateCartRequest = {
      quantity,
      total
    };

    this.cartService.updateCartItem(item._id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.updatingItemId = null;

  
  
  
if (res.success) {

  item.quantity = quantity;
  item.total = total;

  // Update header cart badge
  window.dispatchEvent(
    new Event('cart-updated')
  );

}

else {
            this.toast.error(res.message, 'Error');
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.updatingItemId = null;
          this.toast.error('Failed to update quantity.', 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  removeItem(item: CartItem): void {
    this.alert.confirm(
      'Remove Item?',
      'Are you sure you want to remove this item from the cart?',
      'Remove',
      'Cancel'
    ).then((result: any) => {

      if (!result.isConfirmed) {
        return;
      }

      this.cartService.deleteCartItem(item._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            
if (res.success) {

  this.cartItems = this.cartItems.filter(
    cart => cart._id !== item._id
  );

  // Notify header that the cart has changed
  window.dispatchEvent(
    new Event('cart-updated')
  );

  this.toast.success(
    'Item removed from cart.',
    'Removed'
  );



            } else {
              this.toast.error(res.message, 'Error');
            }

            this.cdr.detectChanges();
          },
          error: () => {
            this.toast.error('Failed to remove item.', 'Error');
            this.cdr.detectChanges();
          }
        });

    });
  }

  trackByCartId(index: number, item: CartItem): string {
    return item._id;
  }

}