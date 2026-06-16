import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AlertService } from '../../../core/services/alert';
import { Toast } from '../../../core/services/toast';
import { Order as OrderService } from '../../../core/services/order';

import {
  OrderItem,
  OrderProduct
} from '../../../core/interfaces/order.interface';

import { APP_INFO } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit, OnDestroy {

  order?: OrderItem;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private alert: AlertService,
    private toast: Toast,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getOrderDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.toast.error('Order ID not found.', 'Error');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.orderService.getOrderById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          if (res.success) {
            this.order = res.data;
          } else {
            this.toast.error(res.message, 'Error');
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load order details.', 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  get orderId(): string {
    return this.order?._id
      ? '#' + this.order._id.slice(-6).toUpperCase()
      : '';
  }

  get invoiceId(): string {
    return this.order?._id
      ? 'INV-' + this.order._id.slice(-6).toUpperCase()
      : '';
  }

  get canCancel(): boolean {
    return this.order?.orderStatus === 'Pending';
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Pending':
      case 'Confirmed':
        return 'processing';

      case 'Shipped':
        return 'shipped';

      case 'Delivered':
        return 'delivered';

      case 'Cancelled':
        return 'cancelled';

      default:
        return 'processing';
    }
  }

  cancelOrder(): void {
    if (!this.order) {
      return;
    }

    this.alert.confirm(
      'Cancel Order?',
      'Are you sure you want to cancel this order?',
      'Yes, Cancel',
      'No'
    ).then((result) => {

      if (!result.isConfirmed || !this.order) {
        return;
      }

      this.orderService.updateOrder(this.order._id, {
        orderStatus: 'Cancelled'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            if (res.success && this.order) {
              this.order.orderStatus = 'Cancelled';

              this.alert.success(
                'Order cancelled successfully.',
                'Cancelled'
              );
            } else {
              this.toast.error(res.message, 'Error');
            }

            this.cdr.detectChanges();
          },
          error: () => {
            this.toast.error('Failed to cancel order.', 'Error');
            this.cdr.detectChanges();
          }
        });

    });
  }

  downloadInvoice(): void {
    if (!this.order) {
      return;
    }

    const productsText = this.order.products
      .map((product: OrderProduct) => {
        const productTotal = product.price * product.quantity;

        return `
Product  : ${product.productName}
Quantity : ${product.quantity}
Price    : ₹${product.price}
Total    : ₹${productTotal}
----------------------------------`;
      })
      .join('\n');

    const invoiceContent = `
${APP_INFO.COMPANY_NAME}
${APP_INFO.ADDRESS}
Phone : ${APP_INFO.PHONE}
Email : ${APP_INFO.EMAIL}
Website : ${APP_INFO.WEBSITE}

----------------------------------

Invoice No : ${this.invoiceId}
Order ID   : ${this.orderId}
Date       : ${this.order.createdAt || '-'}

Customer   : ${this.order.customerName}
Phone      : ${this.order.phone}
Email      : ${this.order.email || '-'}

----------------------------------

${productsText}

Subtotal   : ₹${this.order.totalAmount}
Delivery   : Free

Total      : ₹${this.order.totalAmount}

----------------------------------

Thank you for shopping with
${APP_INFO.COMPANY_NAME}
`;

    const blob = new Blob([invoiceContent], {
      type: 'text/plain'
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.invoiceId}.txt`;
    a.click();

    window.URL.revokeObjectURL(url);

    this.alert.success(
      'Invoice downloaded successfully.',
      'Downloaded'
    );
  }

  trackByProduct(index: number, product: OrderProduct): string {
    return product.productName;
  }

}