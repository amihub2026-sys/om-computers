import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { BookingService } from '../../../core/services/booking.service';
import {
  Booking,
  BookingResponse
} from '../../../core/interfaces/booking.interface';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
})
export class MyBookings implements OnInit, OnDestroy {

  bookings: Booking[] = [];
  isLoading = false;

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

    this.bookingService.getBookings()
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
}