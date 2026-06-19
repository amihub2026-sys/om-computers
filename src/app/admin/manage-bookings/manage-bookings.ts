import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { BookingService } from '../../core/services/booking.service';
import {
  Booking,
  BookingResponse,
  BookingStatus
} from '../../core/interfaces/booking.interface';
import { CommonPagination } from '../../shared/components/common-pagination/common-pagination';
@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonPagination],
  templateUrl: './manage-bookings.html',
  styleUrl: './manage-bookings.css',
})
export class ManageBookings implements OnInit, OnDestroy {

  bookings: Booking[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  statuses: BookingStatus[] = [
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.isLoading = true;

    this.bookingService.getAdminBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BookingResponse) => {
          this.bookings = res.data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.bookings = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
   
   get paginatedBookings(): Booking[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.bookings.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.bookings.length / this.pageSize);
}

changePage(page: number): void {
  this.currentPage = page;
}

  trackByBooking(index: number, booking: Booking): string {
    return booking._id;
  }

  updateStatus(booking: Booking, status: BookingStatus): void {
    if (!booking._id || booking.status === status) {
      return;
    }

    this.bookingService.updateAdminBookingStatus(booking._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          booking.status = status;
          alert('Booking status updated');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('Status update failed');
        }
      });
  }
}