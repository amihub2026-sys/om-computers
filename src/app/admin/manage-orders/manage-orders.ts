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

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css',
})
export class ManageOrders implements OnInit, OnDestroy {

  orders: OrderItem[] = [];
  isLoading = false;

  statuses: OrderItem['orderStatus'][] = [
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled'
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
          this.orders = res.data || [];
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

  trackByOrder(index: number, order: OrderItem): string {
    return order._id;
  }

  getProductNames(order: OrderItem): string {
    return order.products
      .map(product => product.productName)
      .join(', ');
  }

  updateStatus(order: OrderItem, status: OrderItem['orderStatus']): void {
    if (order.orderStatus === status) {
      return;
    }

    this.orderService.updateAdminOrderStatus(order._id, status)
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
}