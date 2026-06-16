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
    this.getCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCartItems(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.cartService.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.cartItems = res.success ? res.data : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cartItems = [];
          this.toast.error('Failed to load cart items.', 'Error');
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
          } else {
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