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

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-bookings.html',
  styleUrl: './manage-bookings.css',
})
export class ManageBookings implements OnInit, OnDestroy {

  bookings: Booking[] = [];
  isLoading = false;

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