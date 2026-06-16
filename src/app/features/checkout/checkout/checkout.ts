import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Toast } from '../../../core/services/toast';
import { Cart as CartService } from '../../../core/services/cart';
import { CartItem } from '../../../core/interfaces/cart.interface';
import { Order as OrderService } from '../../../core/services/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  isLoading = false;
  isPlacingOrder = false;

  orderData = {
    customerName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    paymentMethod: ''
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private toast: Toast,
    private cartService: CartService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCartItems(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.cartService.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (res.success) {
            this.cartItems = res.data;

            if (this.cartItems.length > 0) {
              this.orderData.customerName = this.cartItems[0].customerName || '';
              this.orderData.phone = this.cartItems[0].phone || '';
            }
          } else {
            this.cartItems = [];
          }

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

  get totalAmount(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  }

  validateOrder(): boolean {
    if (!this.orderData.customerName.trim()) {
      this.toast.error('Please enter full name.', 'Required');
      return false;
    }

    if (!this.orderData.phone.trim()) {
      this.toast.error('Please enter mobile number.', 'Required');
      return false;
    }

    if (!this.orderData.email.trim()) {
      this.toast.error('Please enter email address.', 'Required');
      return false;
    }

    if (!this.orderData.city.trim()) {
      this.toast.error('Please enter city.', 'Required');
      return false;
    }

    if (!this.orderData.address.trim()) {
      this.toast.error('Please enter delivery address.', 'Required');
      return false;
    }

    if (!this.orderData.paymentMethod) {
      this.toast.error('Please select payment method.', 'Required');
      return false;
    }

    return true;
  }

placeOrder(): void {
  if (!this.validateOrder()) {
    return;
  }

  this.isPlacingOrder = true;
  this.cdr.detectChanges();

  const orderPayload = {
    customerName: this.orderData.customerName,
    phone: this.orderData.phone,
    email: this.orderData.email,
    address: `${this.orderData.address}, ${this.orderData.city}`,
    paymentMethod: this.orderData.paymentMethod
  };

  this.orderService.placeOrder(orderPayload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.isPlacingOrder = false;

        if (res.success) {
          this.cartItems = [];

          this.toast.success(
            'Order placed successfully!',
            'Success'
          );

          this.router.navigate(['/order-success']);
        } else {
          this.toast.error(res.message, 'Error');
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isPlacingOrder = false;
        this.toast.error('Failed to place order.', 'Error');
        this.cdr.detectChanges();
      }
    });
}
trackByCartId(index: number, item: CartItem): string {
  return item._id;
}
}