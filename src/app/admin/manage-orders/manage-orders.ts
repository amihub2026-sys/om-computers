import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { Order } from '../../core/services/order';
import {
  OrderItem,
  OrderResponse
} from '../../core/interfaces/order.interface';
import { CommonPagination } from '../../shared/components/common-pagination/common-pagination';
@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonPagination],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css',
})
export class ManageOrders implements OnInit, OnDestroy {

  orders: OrderItem[] = [];
  isLoading = false;

  selectedOrder: OrderItem | null = null;
  showDetails = false;
showCancelModal = false;
orderToCancel: OrderItem | null = null;
cancellationReason = '';
  currentPage = 1;
  pageSize = 10;
  statuses: OrderItem['orderStatus'][] = [
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];
paymentStatuses: OrderItem['paymentStatus'][] = [
  'Pending',
  'Paid',
  'Failed'
];
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: Order,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.isLoading = true;

    this.orderService.getAdminOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res: OrderResponse) => {

  this.orders = (res.data || []).filter(
    order =>
      order.orderStatus !== 'Delivered' &&
      order.orderStatus !== 'Cancelled'
  );

  this.currentPage = 1;
  this.isLoading = false;

  this.cdr.detectChanges();
},
        error: (err) => {
          console.error(err);
          this.orders = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
  
get paginatedOrders(): OrderItem[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.orders.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.orders.length / this.pageSize);
}

changePage(page: number): void {
  this.currentPage = page;
}

  trackByOrder(index: number, order: OrderItem): string {
    return order._id;
  }

  getProductNames(order: OrderItem): string {
    return order.products
      .map(product => product.productName)
      .join(', ');
  }
  openOrderDetails(order: OrderItem): void {
  this.selectedOrder = order;
  this.showDetails = true;
}

closeOrderDetails(): void {
  this.selectedOrder = null;
  this.showDetails = false;
}

updateStatus(
  order: OrderItem,
  status: OrderItem['orderStatus']
): void {

  if (order.orderStatus === status) {
    return;
  }

  // If Cancelled is selected, ask for reason first
  if (status === 'Cancelled') {
    this.orderToCancel = order;
    this.cancellationReason = '';
    this.showCancelModal = true;
    return;
  }

  this.orderService
    .updateAdminOrderStatus(order._id, status)
    .pipe(takeUntil(this.destroy$))
    .subscribe({

      next: () => {
        order.orderStatus = status;

        alert('Order status updated');

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
        alert('Order status update failed');
      }

    });
}
confirmCancelOrder(): void {

  if (!this.orderToCancel || !this.orderToCancel._id) {
    return;
  }

  if (!this.cancellationReason.trim()) {
    alert('Please enter cancellation reason');
    return;
  }

  this.orderService
    .updateAdminOrderStatus(
      this.orderToCancel._id,
      'Cancelled',
      this.cancellationReason.trim()
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({

      next: () => {

        this.orderToCancel!.orderStatus = 'Cancelled';

        this.showCancelModal = false;
        this.orderToCancel = null;
        this.cancellationReason = '';

        alert('Order cancelled successfully');

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
        alert('Order cancellation failed');
      }

    });
}


closeCancelModal(): void {
  this.showCancelModal = false;
  this.orderToCancel = null;
  this.cancellationReason = '';
}
  updatePaymentStatus(
  order: OrderItem,
  status: OrderItem['paymentStatus']
): void {

  if (order.paymentStatus === status) {
    return;
  }

  this.orderService
    .updateAdminPaymentStatus(order._id, status)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        order.paymentStatus = status;
        alert('Payment status updated');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Payment status update failed');
      }
    });
}
}