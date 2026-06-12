import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Toast } from '../../../core/services/toast';
@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './service-details.html',
  styleUrl: './service-details.css',
})
export class ServiceDetails {

  constructor(
  private router: Router,
  private toast: Toast
) {}
bookService() {
  this.toast.success(
    'Redirecting to service booking...',
    'Book Service'
  );

  this.router.navigate(['/service-booking/1']);
}
}