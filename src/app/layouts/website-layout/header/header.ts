import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { Cart as CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  mobileMenuOpen = false;
  mobileAccountOpen = false;
  cartCount = 0;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCartCount();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getCartCount();
      });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCartCount(): void {
    if (!this.isLoggedIn) {
      this.cartCount = 0;
      this.cdr.detectChanges();
      return;
    }

    this.cartService.getCartItems().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cartCount = res.data.reduce(
            (sum: number, item: any) => sum + Number(item.quantity || 0),
            0
          );
        } else {
          this.cartCount = 0;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.cartCount = 0;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.cartCount = 0;
    this.mobileMenuOpen = false;
    this.mobileAccountOpen = false;
    this.router.navigate(['/']);
  }

}