import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Auth } from '../../../core/services/auth';
import { Toast } from '../../../core/services/toast';
import { LoginRequest } from '../../../core/interfaces/login-request';
import { AuthResponse } from '../../../core/interfaces/auth-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  private loginSub?: Subscription;

  constructor(
    private auth: Auth,
    private router: Router,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    console.log('Login page loaded');
  }

  login(): void {
    this.loginSub = this.auth.login(this.loginData).subscribe({
      next: (res: AuthResponse) => {
        if (res?.token) {
          this.auth.saveToken(res.token);
          this.toast.success('Login successful', 'Welcome');

          if (res.data?.role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: () => {
        this.toast.error('Invalid credentials', 'Error');
      }
    });
  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
  }
}