import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/interfaces/customer.interface';
import { CommonPagination } from '../../shared/components/common-pagination/common-pagination';
@Component({
  selector: 'app-manage-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonPagination],
  templateUrl: './manage-admins.html',
  styleUrls: ['./manage-admins.css']
})
export class ManageAdminsComponent implements OnInit {

admins: Customer[] = [];
showForm = false;
isLoading = false;
currentPage = 1;
pageSize = 10;
showPassword = false;

createdAdmin: any = null;

  adminForm = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins() {
    this.customerService.getCustomers().subscribe({
      next: (res) => {
        this.admins = res.data.filter(
          user => user.role?.toLowerCase() === 'admin'
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Admin load error:', err);
      }
    });
  }
  get paginatedAdmins(): Customer[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.admins.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.admins.length / this.pageSize);
}

changePage(page: number): void {
  this.currentPage = page;
} 

  openAddAdmin() {
    this.showForm = true;
    this.createdAdmin = null;

    this.adminForm = {
      name: '',
      email: '',
      phone: '',
      password: ''
    };

    this.cdr.detectChanges();
  }

  cancelForm() {
    this.showForm = false;
    this.cdr.detectChanges();
  }

  saveAdmin() {
    if (!this.adminForm.name || !this.adminForm.email || !this.adminForm.password) {
      alert('Name, email and password are required');
      return;
    }

    this.isLoading = true;

    this.customerService.createAdmin({
      name: this.adminForm.name,
      email: this.adminForm.email,
      phone: this.adminForm.phone,
      password: this.adminForm.password
    }).subscribe({
      next: (res: any) => {
        this.createdAdmin = {
          adminId: res.data.adminId || res.data._id,
          email: res.data.email,
          password: this.adminForm.password
        };

        this.showForm = false;
        this.isLoading = false;
        this.loadAdmins();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Admin create failed');
        console.error('Create admin error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  removeAdmin(admin: Customer) {
    if (!confirm('Are you sure you want to remove this admin?')) return;

    this.customerService.updateUserRole(admin._id, 'user').subscribe({
      next: () => {
        this.loadAdmins();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Remove admin failed');
        console.error('Remove admin error:', err);
      }
    });
  }
}