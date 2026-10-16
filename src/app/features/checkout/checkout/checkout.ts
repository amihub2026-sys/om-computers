import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Toast } from '../../../core/services/toast';
import { Cart as CartService } from '../../../core/services/cart';
import { CartItem } from '../../../core/interfaces/cart.interface';
import { Order as OrderService } from '../../../core/services/order';
import { PlaceOrderRequest } from '../../../core/interfaces/order.interface';
import { ProductService } from '../../../core/services/product.service';
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


orderData: {
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  paymentMethod: '' | 'UPI' | 'Cash on Delivery';
  transactionId: string;
} = {
  customerName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  paymentMethod: '',
  transactionId: ''
};

  private destroy$ = new Subject<void>();

constructor(
  private router: Router,
  private route: ActivatedRoute,
  private toast: Toast,
  private cartService: CartService,
  private orderService: OrderService,
  private productService: ProductService,
  private cdr: ChangeDetectorRef
) {}

ngOnInit(): void {
  const productId = this.route.snapshot.queryParamMap.get('productId');

  console.log('CHECKOUT PRODUCT ID:', productId);

  if (productId) {
    this.loadSingleProduct(productId);
  } else {
    this.loadCartItems();
  }
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSingleProduct(productId: string): void {
  this.isLoading = true;
  this.cdr.detectChanges();

  this.productService.getProductById(productId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const product = res.data || res;

        this.cartItems = [
   {
  _id: product._id,
  userId: '',
  customerName: '',
  phone: '',
  productId: product._id,
  productName: product.name,
  image: product.image || '',
  price: Number(product.price || 0),
  quantity: 1,
  total: Number(product.price || 0)
} as CartItem
];

this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.isLoading = false;
        this.cartItems = [];

        this.toast.error(
          'Failed to load product.',
          'Error'
        );

        this.cdr.detectChanges();
      }
    });
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
if (!/^[0-9]{10}$/.test(this.orderData.phone.trim())) {
  this.toast.error(
    'Mobile number must be exactly 10 digits.',
    'Invalid Mobile Number'
  );
  return false;
}
   if (
  this.orderData.email.trim() &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.orderData.email.trim())
) {
  this.toast.error('Please enter a valid email address.', 'Invalid Email');
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
if (
  this.orderData.paymentMethod === 'UPI' &&
  !this.orderData.transactionId.trim()
) {
  this.toast.error(
    'Please enter UPI Transaction ID / UTR number.',
    'Required'
  );

  return false;
}
    return true;
  }


placeOrder(): void {
  if (this.isPlacingOrder) {
    return;
  }

  if (!this.validateOrder()) {
    return;
  }

  if (this.cartItems.length === 0) {
    this.toast.error(
      'No products selected.',
      'Error'
    );
    return;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    this.toast.error(
      'Please sign in before placing your order.',
      'Login Required'
    );
    return;
  }

  const productId =
    this.route.snapshot.queryParamMap.get('productId');

    
const paymentMethod = this.orderData.paymentMethod;

if (
  paymentMethod !== 'UPI' &&
  paymentMethod !== 'Cash on Delivery'
) {
  this.toast.error(
    'Please select a valid payment method.',
    'Required'
  );
  return;
}

const payload = {
  customerName: this.orderData.customerName.trim(),
  phone: this.orderData.phone.trim(),
  email: this.orderData.email.trim(),
  address: [
    this.orderData.address.trim(),
    this.orderData.city.trim()
  ].filter(Boolean).join(', '),
  paymentMethod,
  transactionId:
    paymentMethod === 'UPI'
      ? this.orderData.transactionId.trim()
      : ''
};


  this.isPlacingOrder = true;
  this.cdr.detectChanges();

  
const request$ = productId
  ? this.orderService.buyNowOrder({
      ...payload,
      productId,
      quantity: 1
    })
  : this.orderService.placeOrder({
      ...payload,

items: this.cartItems.map(item => ({
  productId: item.productId || '',
  quantity: Number(item.quantity)
}))
    });


  request$
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.isPlacingOrder = false;

        if (!res.success || !res.data?._id) {
          this.toast.error(
            res.message || 'Unable to confirm your order.',
            'Order Failed'
          );
          this.cdr.detectChanges();
          return;
        }

        const savedOrderId = res.data._id;

        // Only cart checkout should clear the cart.
        // Buy Now must not remove unrelated cart items.
        if (!productId) {
          this.cartService.clearCart();
        }

        this.toast.success(
          'Order placed successfully!',
          'Success'
        );

        this.router.navigate(['/order-success'], {
          queryParams: {
            orderId: savedOrderId
          }
        });

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Order placement failed:', err);

        this.isPlacingOrder = false;

        if (err.status === 401) {
          this.toast.error(
            'Your login has expired. Please sign in again.',
            'Authentication Required'
          );
        } else {
          this.toast.error(
            err.error?.message ||
              'Failed to place order. Please try again.',
            'Order Failed'
          );
        }

        this.cdr.detectChanges();
      }
    });
}

trackByCartId(index: number, item: CartItem): string {
  return item._id;
}
}