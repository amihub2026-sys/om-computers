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
import { BookingService } from '../../../core/services/booking.service';
import {
  Booking,
  SingleBookingResponse
} from '../../../core/interfaces/booking.interface';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.css',
})
export class BookingDetails implements OnInit, OnDestroy {

  booking?: Booking;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private alert: AlertService,
    private toast: Toast,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBooking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooking(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.toast.error('Booking ID not found', 'Error');
      return;
    }

    this.isLoading = true;

    this.bookingService.getBookingById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: SingleBookingResponse) => {
          this.booking = res.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.toast.error('Failed to load booking', 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  get bookingId(): string {
    return this.booking?._id
      ? '#' + this.booking._id.slice(-6).toUpperCase()
      : '';
  }

  cancelBooking(): void {
    if (!this.booking?._id) return;

    this.alert.confirm(
      'Cancel Booking?',
      'Are you sure you want to cancel this booking?',
      'Yes, Cancel',
      'No'
    ).then((result) => {
      if (!result.isConfirmed || !this.booking?._id) return;

      this.bookingService.updateBooking(this.booking._id, {
        status: 'Cancelled'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: SingleBookingResponse) => {
            if (res.success && this.booking) {
              this.booking.status = 'Cancelled';
              this.toast.success('Booking cancelled successfully!', 'Cancelled');
              this.cdr.detectChanges();
            } else {
              this.toast.error(res.message || 'Cancel failed', 'Error');
            }
          },
          error: (err) => {
            console.error(err);
            this.toast.error('Cancel failed', 'Error');
          }
        });
    });
  }
}