import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Toast } from '../../../core/services/toast';
@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './service-booking.html',
  styleUrl: './service-booking.css',
})
export class ServiceBooking {
  constructor(
  private router: Router,
  private toast: Toast
) {}
bookService() {

  this.toast.success(
    'Service booked successfully!',
    'Success'
  );

  this.router.navigate(['/booking-success']);

}
}