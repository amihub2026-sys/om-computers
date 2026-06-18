import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  stats = {
    totalUsers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalCarts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingBookings: 0
  };

  recentOrders: any[] = [];
  recentBookings: any[] = [];

  isLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = {
          totalUsers: res.data?.totalUsers || 0,
          totalAdmins: res.data?.totalAdmins || 0,
          totalProducts: res.data?.totalProducts || 0,
          totalServices: res.data?.totalServices || 0,
          totalOrders: res.data?.totalOrders || 0,
          totalBookings: res.data?.totalBookings || 0,
          totalCarts: res.data?.totalCarts || 0,
          totalRevenue: res.data?.totalRevenue || 0,
          pendingOrders: res.data?.pendingOrders || 0,
          pendingBookings: res.data?.pendingBookings || 0
        };

        this.recentOrders = res.data?.recentOrders || [];
        this.recentBookings = res.data?.recentBookings || [];

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}