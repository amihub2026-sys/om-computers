import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-customers',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './manage-customers.html',
  styleUrl: './manage-customers.css',
})
export class ManageCustomers {}