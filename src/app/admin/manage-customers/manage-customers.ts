import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CustomerService } from '../../core/services/customer.service';
import {
  Customer,
  CustomerResponse
} from '../../core/interfaces/customer.interface';

@Component({
  selector: 'app-manage-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-customers.html',
  styleUrl: './manage-customers.css',
})
export class ManageCustomers implements OnInit, OnDestroy {

  customers: Customer[] = [];
  isLoading = false;

  roles: Array<'user' | 'admin'> = ['user', 'admin'];

  private destroy$ = new Subject<void>();

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomers(): void {
    this.isLoading = true;

    this.customerService.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: CustomerResponse) => {
          this.customers = res.data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.customers = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  trackByCustomer(index: number, customer: Customer): string {
    return customer._id;
  }

  toggleStatus(customer: Customer): void {
    const newStatus = !customer.isActive;

    this.customerService.updateUserStatus(customer._id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          customer.isActive = newStatus;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('Status update failed');
        }
      });
  }

  updateRole(customer: Customer, role: 'user' | 'admin'): void {
    if (customer.role === role) {
      return;
    }

    this.customerService.updateUserRole(customer._id, role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          customer.role = role;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('Role update failed');
        }
      });
  }
}