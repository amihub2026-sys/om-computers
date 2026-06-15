import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList {

  showFilters = false;

  filters = {
    laptopRepair: false,
    desktopRepair: false,
    printerService: false,
    networking: false,
    dataRecovery: false,
    doorstep: false,
    inShop: false,
    remote: false,
    sameDay: false,
    support247: false,
    business: false,
  };

  resetFilters() {
    Object.keys(this.filters).forEach((key) => {
      this.filters[key as keyof typeof this.filters] = false;
    });
  }

  applyFilters() {
    this.showFilters = false;
  }
}