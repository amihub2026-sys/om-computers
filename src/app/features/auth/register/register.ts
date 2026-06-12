import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  constructor(private router: Router) {}

  register() {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isRegistered', 'true');

    this.router.navigate(['/']);
  }

}