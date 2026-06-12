import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  constructor(
    private router: Router,
    private toast: Toast
  ) {}

  register() {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isRegistered', 'true');

    this.toast.success(
      'Registration successful!',
      'Welcome'
    );

    this.router.navigate(['/']);
  }

}