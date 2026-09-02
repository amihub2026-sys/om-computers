import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/interfaces/customer.interface';
import { CommonPagination } from '../../shared/components/common-pagination/common-pagination';

@Component({
  selector: 'app-manage-admins',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommonPagination
  ],
  templateUrl: './manage-admins.html',
  styleUrls: ['./manage-admins.css']
})
export class ManageAdminsComponent implements OnInit {

  admins: Customer[] = [];

  showForm = false;
  showEditForm = false;

  isLoading = false;

  currentPage = 1;
  pageSize = 10;

  showPassword = false;
  showEditPassword = false;

  createdAdmin: any = null;

  selectedAdmin: Customer | null = null;

  adminForm = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };

  editAdminForm = {
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


  // ==========================================
  // LOAD ADMINS
  // ==========================================

  loadAdmins(): void {

    this.customerService
      .getCustomers()
      .subscribe({

        next: (res) => {

          this.admins = res.data.filter(
            user =>
              user.role?.toLowerCase() === 'admin'
          );

          this.currentPage = 1;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Admin load error:',
            err
          );

        }

      });

  }


  // ==========================================
  // PAGINATION
  // ==========================================

  get paginatedAdmins(): Customer[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    return this.admins.slice(
      start,
      start + this.pageSize
    );

  }


  get totalPages(): number {

    return Math.ceil(
      this.admins.length /
      this.pageSize
    );

  }


  changePage(page: number): void {

    this.currentPage = page;

  }


  // ==========================================
  // OPEN ADD ADMIN
  // ==========================================

  openAddAdmin(): void {

    this.showForm = true;

    this.showEditForm = false;

    this.createdAdmin = null;

    this.showPassword = false;

    this.adminForm = {
      name: '',
      email: '',
      phone: '',
      password: ''
    };

    this.cdr.detectChanges();

  }


  // ==========================================
  // CANCEL ADD FORM
  // ==========================================

  cancelForm(): void {

    this.showForm = false;

    this.showPassword = false;

    this.cdr.detectChanges();

  }


  // ==========================================
  // SAVE ADMIN
  // ==========================================

  saveAdmin(): void {

    if (
      !this.adminForm.name.trim() ||
      !this.adminForm.email.trim() ||
      !this.adminForm.password.trim()
    ) {

      alert(
        'Name, email and password are required'
      );

      return;

    }


    this.isLoading = true;


    this.customerService
      .createAdmin({

        name:
          this.adminForm.name.trim(),

        email:
          this.adminForm.email.trim(),

        phone:
          this.adminForm.phone.trim(),

        password:
          this.adminForm.password

      })
      .subscribe({

        next: (res: any) => {

          this.createdAdmin = {

            adminId:
              res.data.adminId ||
              res.data._id,

            email:
              res.data.email,

            password:
              this.adminForm.password

          };


          this.showForm = false;

          this.showPassword = false;

          this.isLoading = false;

          this.loadAdmins();

          this.cdr.detectChanges();

        },


        error: (err) => {

          this.isLoading = false;

          alert(
            err.error?.message ||
            'Admin create failed'
          );

          console.error(
            'Create admin error:',
            err
          );

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // OPEN EDIT ADMIN
  // ==========================================

  openEditAdmin(admin: Customer): void {

    this.selectedAdmin = admin;

    this.showEditForm = true;

    this.showForm = false;

    this.showEditPassword = false;


    this.editAdminForm = {

      name:
        admin.name || '',

      email:
        admin.email || '',

      phone:
        admin.phone || '',

      password: ''

    };


    this.cdr.detectChanges();

  }


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  cancelEdit(): void {

    this.showEditForm = false;

    this.selectedAdmin = null;

    this.showEditPassword = false;

    this.editAdminForm = {
      name: '',
      email: '',
      phone: '',
      password: ''
    };

    this.cdr.detectChanges();

  }


  // ==========================================
  // SAVE EDITED ADMIN
  // ==========================================

  saveEditedAdmin(): void {

    if (!this.selectedAdmin) {
      return;
    }


    if (
      !this.editAdminForm.name.trim() ||
      !this.editAdminForm.email.trim()
    ) {

      alert(
        'Name and email are required'
      );

      return;

    }


    const updateData: any = {

      name:
        this.editAdminForm.name.trim(),

      email:
        this.editAdminForm.email.trim(),

      phone:
        this.editAdminForm.phone.trim()

    };


    if (
      this.editAdminForm.password.trim()
    ) {

      updateData.password =
        this.editAdminForm.password.trim();

    }


    this.isLoading = true;


    this.customerService
      .updateAdmin(
        this.selectedAdmin._id,
        updateData
      )
      .subscribe({

        next: () => {

          this.isLoading = false;

          this.showEditForm = false;

          this.selectedAdmin = null;

          this.showEditPassword = false;

          alert(
            'Admin updated successfully'
          );

          this.loadAdmins();

          this.cdr.detectChanges();

        },


        error: (err) => {

          this.isLoading = false;

          alert(
            err.error?.message ||
            'Admin update failed'
          );

          console.error(
            'Admin update error:',
            err
          );

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // REMOVE ADMIN
  // CHANGE ADMIN ROLE TO USER
  // ==========================================

  removeAdmin(admin: Customer): void {

    if (
      !confirm(
        'Are you sure you want to remove this admin role?'
      )
    ) {
      return;
    }


    this.customerService
      .updateUserRole(
        admin._id,
        'user'
      )
      .subscribe({

        next: () => {

          alert(
            'Admin role removed successfully'
          );

          this.loadAdmins();

          this.cdr.detectChanges();

        },


        error: (err) => {

          alert(
            err.error?.message ||
            'Remove admin failed'
          );

          console.error(
            'Remove admin error:',
            err
          );

        }

      });

  }


  // ==========================================
  // DELETE ADMIN
  // PERMANENT DELETE
  // ==========================================

  deleteAdmin(admin: Customer): void {

    const confirmed = confirm(
      `Are you sure you want to permanently delete ${admin.name || admin.email}?`
    );

    if (!confirmed) {
      return;
    }


    const secondConfirm = confirm(
      'This action cannot be undone. Delete this admin permanently?'
    );

    if (!secondConfirm) {
      return;
    }


    this.isLoading = true;


    this.customerService
      .deleteAdmin(admin._id)
      .subscribe({

        next: () => {

          this.isLoading = false;

          alert(
            'Admin deleted permanently'
          );


          this.admins =
            this.admins.filter(
              item =>
                item._id !== admin._id
            );


          if (
            this.currentPage >
            this.totalPages &&
            this.currentPage > 1
          ) {

            this.currentPage--;

          }


          this.cdr.detectChanges();

        },


        error: (err) => {

          this.isLoading = false;

          alert(
            err.error?.message ||
            'Admin delete failed'
          );

          console.error(
            'Delete admin error:',
            err
          );

          this.cdr.detectChanges();

        }

      });

  }

}