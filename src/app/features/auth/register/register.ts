import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Auth } from '../../../core/services/auth';
import { Toast } from '../../../core/services/toast';
import { RegisterRequest } from '../../../core/interfaces/register-request';
import { AuthResponse } from '../../../core/interfaces/auth-response';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {

  registerData: RegisterRequest = {
    name: '',
    phone: '',
    email: '',
    password: '',
    address: ''
  };

  confirmPassword = '';

  private registerSub?: Subscription;

  constructor(
    private auth: Auth,
    private router: Router,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    console.log('Register page loaded');
  }

  register(): void {
    if (
      !this.registerData.name ||
      !this.registerData.email ||
      !this.registerData.phone ||
      !this.registerData.password
    ) {
      this.toast.error('Please fill all required fields', 'Error');
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.toast.error('Passwords do not match', 'Error');
      return;
    }

    this.registerSub = this.auth.register(this.registerData).subscribe({
     next: (res: AuthResponse) => {

  if (res?.token) {
    this.auth.saveToken(res.token);
  }

  this.toast.success('Registration successful', 'Welcome');
  this.router.navigate(['/']);

},
      error: (err) => {
        console.log(err);
        this.toast.error('Server error', 'Error');
      }
    });
  }

  ngOnDestroy(): void {
    this.registerSub?.unsubscribe();
  }
}