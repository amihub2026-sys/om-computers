import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Toast } from '../../../core/services/toast';
import { ServiceService } from '../../../core/services/service.service';
import { BookingService } from '../../../core/services/booking.service';
import { ServiceBookingForm } from '../../../core/interfaces/service.interface';

@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './service-booking.html',
  styleUrl: './service-booking.css',
})
export class ServiceBooking implements OnInit {

  serviceId = '';

  booking: ServiceBookingForm = {
    customerName: '',
    phone: '',
    email: '',
    serviceName: '',
    bookingDate: '',
    bookingTime: '',
    address: '',
    issueDescription: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast,
    private serviceService: ServiceService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';

    if (this.serviceId) {
      this.serviceService.getServiceById(this.serviceId).subscribe({
        next: (res) => {
          this.booking.serviceName = res.data?.name || '';
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Service not found', 'Error');
          this.router.navigate(['/services']);
        }
      });
    }
  }

  bookService(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.toast.error('Please login to book service.', 'Login Required');
      this.router.navigate(['/login']);
      return;
    }

    this.bookingService.createBooking(this.booking).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toast.success('Service booked successfully!', 'Success');
          this.router.navigate(['/booking-success']);
        } else {
          this.toast.error(res.message || 'Booking failed', 'Error');
        }
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Service booking failed', 'Error');
      }
    });
  }
}