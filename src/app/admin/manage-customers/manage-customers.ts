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
import { BookingService } from '../../core/services/booking.service';

import {
  OrderItem,
  OrderResponse
} from '../../core/interfaces/order.interface';

import {
  Booking,
  BookingResponse
} from '../../core/interfaces/booking.interface';

import {
  CommonPagination
} from '../../shared/components/common-pagination/common-pagination';


export interface CustomerHistoryItem {

  _id: string;

  customerName: string;
  phone: string;
  email?: string;
  address?: string;

  type: 'Order' | 'Service';

  itemName: string;

  status: string;

  amount?: number;

  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;

  cancellationReason?: string;

  date?: string;

  originalOrder?: OrderItem;
  originalBooking?: Booking;
}


@Component({
  selector: 'app-manage-customers',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    CommonPagination
  ],

  templateUrl: './manage-customers.html',
  styleUrl: './manage-customers.css',
})

export class ManageCustomers implements OnInit, OnDestroy {

  customers: CustomerHistoryItem[] = [];

  isLoading = false;

  currentPage = 1;
  pageSize = 10;

  selectedType: 'All' | 'Order' | 'Service' = 'All';

  selectedStatus:
    'All' |
    'Completed' |
    'Delivered' |
    'Cancelled'
    = 'All';

  selectedCustomer: CustomerHistoryItem | null = null;

  showDetails = false;

  private ordersLoaded = false;
  private bookingsLoaded = false;

  private orderHistory: CustomerHistoryItem[] = [];
  private bookingHistory: CustomerHistoryItem[] = [];

  private destroy$ = new Subject<void>();


  constructor(
    private orderService: Order,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadCustomerHistory();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // ==========================================
  // LOAD CUSTOMER HISTORY
  // ==========================================

  loadCustomerHistory(): void {

    this.isLoading = true;

    this.ordersLoaded = false;
    this.bookingsLoaded = false;

    this.orderHistory = [];
    this.bookingHistory = [];

    this.loadOrderHistory();
    this.loadBookingHistory();
  }


  // ==========================================
  // ORDER HISTORY
  // ==========================================

  private loadOrderHistory(): void {

    this.orderService
      .getAdminOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: (res: OrderResponse) => {

          const orders = res.data || [];

          this.orderHistory = orders

            .filter(
              order =>
                order.orderStatus === 'Delivered' ||
                order.orderStatus === 'Cancelled'
            )

            .map(order => ({

              _id: order._id,

              customerName: order.customerName,

              phone: order.phone,

              email: order.email,

              address: order.address,

              type: 'Order' as const,

              itemName:
                order.products
                  .map(
                    product =>
                      product.productName
                  )
                  .join(', '),

              status: order.orderStatus,

              amount: order.totalAmount,

              paymentMethod: order.paymentMethod,

              paymentStatus: order.paymentStatus,

              transactionId: order.transactionId,

              cancellationReason:
                (order as any).cancellationReason || '',

              date:
                order.updatedAt ||
                order.createdAt,

              originalOrder: order

            }));

          this.ordersLoaded = true;

          this.finishLoading();
        },


        error: (err) => {

          console.error(
            'Failed to load order history',
            err
          );

          this.orderHistory = [];

          this.ordersLoaded = true;

          this.finishLoading();
        }

      });
  }


  // ==========================================
  // BOOKING HISTORY
  // ==========================================

  private loadBookingHistory(): void {

    this.bookingService
      .getAdminBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: (res: BookingResponse) => {

          const bookings = res.data || [];

          this.bookingHistory = bookings

            .filter(
              booking =>
                booking.status === 'Completed' ||
                booking.status === 'Cancelled'
            )

            .map(booking => ({

              _id: booking._id,

              customerName: booking.customerName,

              phone: booking.phone,

              email: booking.email,

              address: booking.address,

              type: 'Service' as const,

              itemName: booking.serviceName,

              status: booking.status,

              cancellationReason:
                (booking as any).cancellationReason || '',

              date:
                (booking as any).updatedAt ||
                (booking as any).createdAt ||
                booking.bookingDate,

              originalBooking: booking

            }));

          this.bookingsLoaded = true;

          this.finishLoading();
        },


        error: (err) => {

          console.error(
            'Failed to load booking history',
            err
          );

          this.bookingHistory = [];

          this.bookingsLoaded = true;

          this.finishLoading();
        }

      });
  }


  // ==========================================
  // COMBINE HISTORY
  // ==========================================

  private finishLoading(): void {

    if (
      !this.ordersLoaded ||
      !this.bookingsLoaded
    ) {
      return;
    }

    this.customers = [
      ...this.orderHistory,
      ...this.bookingHistory
    ];

    this.customers.sort(
      (a, b) => {

        const dateA =
          a.date
            ? new Date(a.date).getTime()
            : 0;

        const dateB =
          b.date
            ? new Date(b.date).getTime()
            : 0;

        return dateB - dateA;
      }
    );

    this.currentPage = 1;

    this.isLoading = false;

    this.cdr.detectChanges();
  }


  // ==========================================
  // TYPE FILTER
  // ==========================================

  changeType(
    type: 'All' | 'Order' | 'Service'
  ): void {

    this.selectedType = type;

    this.currentPage = 1;
  }


  // ==========================================
  // STATUS FILTER
  // ==========================================

  changeStatus(
    status:
      'All' |
      'Completed' |
      'Delivered' |
      'Cancelled'
  ): void {

    this.selectedStatus = status;

    this.currentPage = 1;
  }


  // ==========================================
  // FILTERED DATA
  // ==========================================

  get filteredCustomers(): CustomerHistoryItem[] {

    return this.customers.filter(customer => {

      const typeMatch =
        this.selectedType === 'All' ||
        customer.type === this.selectedType;

      const statusMatch =
        this.selectedStatus === 'All' ||
        customer.status === this.selectedStatus;

      return typeMatch && statusMatch;
    });
  }


  // ==========================================
  // PAGINATION
  // ==========================================

  get paginatedCustomers():
    CustomerHistoryItem[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    return this.filteredCustomers.slice(
      start,
      start + this.pageSize
    );
  }


  get totalPages(): number {

    return Math.ceil(
      this.filteredCustomers.length /
      this.pageSize
    );
  }


  changePage(page: number): void {

    this.currentPage = page;
  }


  // ==========================================
  // TRACK BY
  // ==========================================

  trackByCustomer(
    index: number,
    customer: CustomerHistoryItem
  ): string {

    return customer.type + '-' + customer._id;
  }


  // ==========================================
  // VIEW DETAILS
  // ==========================================

  openCustomerDetails(
    customer: CustomerHistoryItem
  ): void {

    this.selectedCustomer = customer;

    this.showDetails = true;
  }


  closeCustomerDetails(): void {

    this.selectedCustomer = null;

    this.showDetails = false;
  }


  // ==========================================
  // STATUS HELPERS
  // ==========================================

  isCancelled(
    customer: CustomerHistoryItem
  ): boolean {

    return customer.status === 'Cancelled';
  }


  isCompleted(
    customer: CustomerHistoryItem
  ): boolean {

    return (
      customer.status === 'Completed' ||
      customer.status === 'Delivered'
    );
  }

}