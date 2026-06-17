import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Order as OrderService } from '../../../core/services/order';
import { Toast } from '../../../core/services/toast';
import { OrderItem } from '../../../core/interfaces/order.interface';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnInit, OnDestroy {

  orders: OrderItem[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private toast: Toast,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getOrders(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.orderService.getOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.orders = res.success ? res.data : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.orders = [];
          this.toast.error('Failed to load orders.', 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  getStatusClass(status: OrderItem['orderStatus']): string {
    switch (status) {
      case 'Pending':
        return 'processing';
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

  trackByOrderId(index: number, order: OrderItem): string {
    return order._id;
  }
}