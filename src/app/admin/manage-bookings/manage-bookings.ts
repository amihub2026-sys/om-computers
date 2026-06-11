import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './manage-bookings.html',
  styleUrl: './manage-bookings.css',
})
export class ManageBookings {}