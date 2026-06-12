import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList {}