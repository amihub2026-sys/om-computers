import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../core/services/auth';
import { Toast } from '../../core/services/toast';

import { LoginRequest } from '../../core/interfaces/login-request';
import { AuthResponse } from '../../core/interfaces/auth-response';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  email = '';
  password = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private toast: Toast
  ) {}

  loginAdmin(): void {
    const payload: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.auth.login(payload).subscribe({
      next: (res: AuthResponse) => {
        if (res.success && res.data?.role === 'admin') {
          localStorage.setItem('token', res.token || '');
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('name', res.data.name || '');
          localStorage.setItem('email', res.data.email || '');

          this.toast.success('Admin login successful', 'Success');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.toast.error('Access denied. Admin only.', 'Error');
        }
      },
      error: () => {
        this.toast.error('Invalid admin login', 'Error');
      }
    });
  }
}