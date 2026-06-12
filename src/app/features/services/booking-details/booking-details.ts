import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../../core/services/alert';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.css',
})
export class BookingDetails {
  bookingStatus = 'Pending';

  constructor(
    private alert: AlertService,
    private toast: Toast
  ) {}

  cancelBooking() {
    this.alert.confirm(
      'Cancel Booking?',
      'Are you sure you want to cancel this booking?',
      'Yes, Cancel',
      'No'
    ).then((result) => {
      if (result.isConfirmed) {
        this.bookingStatus = 'Cancelled';
        this.toast.success('Booking cancelled successfully!', 'Cancelled');
      }
    });
  }
}