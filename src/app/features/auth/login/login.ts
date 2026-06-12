import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Toast } from '../../../core/services/toast';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

 constructor(
  private router: Router,
  private toast: Toast
) {}

login() {
  localStorage.setItem('isLoggedIn', 'true');

  this.toast.success(
    'Login successful!',
    'Welcome'
  );

  this.router.navigate(['/']);
}

}