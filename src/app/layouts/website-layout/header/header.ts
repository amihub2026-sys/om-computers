
import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  NgZone
} from '@angular/core';

import {
  Router,
  RouterModule,
  NavigationEnd
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

import {
  Subject,
  filter,
  takeUntil
} from 'rxjs';

import { Cart as CartService } from '../../../core/services/cart';

import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    google?: any;
    picture?: string;
  }
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  picture?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('googleButton')
  googleButton?: ElementRef<HTMLDivElement>;

  // ==============================
  // HEADER STATE
  // ==============================

  mobileMenuOpen = false;

  cartCount = 0;

  // ==============================
  // GOOGLE LOGIN STATE
  // ==============================

  googleLoading = false;

  googleError = '';

  currentUser: Customer | null = null;

  profileMenuOpen = false;

  private readonly destroy$ = new Subject<void>();

  private googleTimer?: ReturnType<typeof setTimeout>;

  private destroyed = false;

  loginModalOpen = false;

  private onCartUpdated = () => {
  this.getCartCount();
};

private readonly onLoginRequired = () => {
  if (!this.currentUser) {
    this.ngZone.run(() => {
      this.openLoginModal();
    });
  }
};
  // ==============================
  // GOOGLE CLIENT ID
  // ==============================

  private readonly googleClientId =
    '250972070232-vp6hse8flcolpn0tfdu81hb76fi7m4pq.apps.googleusercontent.com';

  // ==============================
  // CONSTRUCTOR
  // ==============================

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private ngZone: NgZone
  ) {}

  // ==============================
  // ON INIT
  // ==============================

  ngOnInit(): void {

    this.restoreCustomer();

    this.getCartCount();

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {

        this.mobileMenuOpen = false;

        this.profileMenuOpen = false;

        this.getCartCount();

      });

      window.addEventListener(
  'cart-updated',
  this.onCartUpdated
);

window.addEventListener(
  'login-required',
  this.onLoginRequired
);
  }

  // ==============================
  // RESTORE SAVED CUSTOMER
  // ==============================

  private restoreCustomer(): void {

    const savedToken = localStorage.getItem('token');

    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      this.currentUser = null;
      return;
    }

    try {

      const parsedUser = JSON.parse(savedUser);

      if (
        parsedUser &&
        typeof parsedUser.name === 'string' &&
        typeof parsedUser.email === 'string'
      ) {

        this.currentUser = parsedUser;

      } else {

        this.currentUser = null;

        localStorage.removeItem('user');

      }

    } catch {

      this.currentUser = null;

      localStorage.removeItem('user');

    }
  }

  // ==============================
  // AFTER VIEW INIT
  // ==============================
ngAfterViewInit(): void {
  // Google button is initialized when the popup opens.
}

  // ==============================
  // INITIALIZE GOOGLE LOGIN
  // ==============================

  private initializeGoogle(attempt = 0): void {

    if (this.destroyed || !this.googleButton) {
      return;
    }

    if (!window.google?.accounts?.id) {

      if (attempt < 50) {

        this.googleTimer = setTimeout(() => {

          this.initializeGoogle(attempt + 1);

        }, 200);

      } else {

        this.googleError =
          'Google Sign-In could not load. Please refresh.';

        this.cdr.detectChanges();

      }

      return;
    }

    window.google.accounts.id.initialize({

      client_id: this.googleClientId,

      callback: (response: any) => {

        this.ngZone.run(() => {

          this.handleGoogleCredential(
            response.credential
          );

        });

      },

      auto_select: false

    });

    this.googleButton.nativeElement.innerHTML = '';

    window.google.accounts.id.renderButton(

      this.googleButton.nativeElement,

      {
        type: 'standard',
        theme: 'outline',
        size: 'medium',
        text: 'signin_with',
        shape: 'pill'
      }

    );
  }

  // ==============================
  // HANDLE GOOGLE LOGIN
  // ==============================

  private handleGoogleCredential(
    credential: string
  ): void {

    if (!credential) {

      this.googleError =
        'Google credential was not received.';

      return;
    }

    if (this.googleLoading) {
      return;
    }

    this.googleLoading = true;

    this.googleError = '';

    this.http.post<any>(

      `${environment.baseUrl}/api/auth/google-login`,

      { credential }

    )
      .pipe(takeUntil(this.destroy$))
      
.subscribe({
  next: (res) => {
    this.googleLoading = false;

    if (!res?.success || !res?.token || !res?.data) {
      this.googleError = 'Google Login failed.';
      this.cdr.detectChanges();
      return;
    }

    // Save verified customer login
    localStorage.setItem('token', res.token);
    localStorage.setItem(
      'user',
      JSON.stringify(res.data)
    );

    // Update customer profile
    this.currentUser = res.data;

    // Close login popup after successful login
    this.loginModalOpen = false;
    this.profileMenuOpen = false;
    this.googleError = '';

    // Refresh cart count
    this.getCartCount();

    this.cdr.detectChanges();
  },

  error: (err) => {
    this.googleLoading = false;

    this.googleError =
      err.error?.message ||
      'Google Login failed. Please try again.';

    this.cdr.detectChanges();
  }
});

  }

  // ==============================
  // GET CART COUNT
  // ==============================


getCartCount(): void {

  const token = localStorage.getItem('token');

  if (!token) {
    this.cartCount = 0;
    this.cdr.detectChanges();
    return;
  }

  this.cartService.getCartItems()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {

        const items = Array.isArray(res?.data)
          ? res.data
          : [];

        this.cartCount = res?.success
          ? items.reduce(
              (total: number, item: any) =>
                total + Number(item.quantity ?? 0),
              0
            )
          : 0;

        this.cdr.detectChanges();
      },

      error: () => {
        this.cartCount = 0;
        this.cdr.detectChanges();
      }
    });
}

  // ==============================
  // TOGGLE PROFILE DROPDOWN
  // ==============================

  toggleProfileMenu(): void {

    if (!this.currentUser) {
      return;
    }

    this.profileMenuOpen =
      !this.profileMenuOpen;

  }

  // ==============================
  // LOGOUT
  // ==============================

  
logout(): void {
  // Clear login details
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Reset customer information
  this.currentUser = null;
  this.profileMenuOpen = false;
  this.mobileMenuOpen = false;
  this.loginModalOpen = false;
  this.googleError = '';

  // Reset cart badge
  this.cartCount = 0;

  // Prevent automatic Google sign-in
  window.google?.accounts?.id?.disableAutoSelect();

  // Return to homepage and refresh state
  this.router.navigate(['/']).then(() => {
    window.location.reload();
  });
}


  // ==============================
  // DESTROY
  // ==============================

  ngOnDestroy(): void {

    this.destroyed = true;

    if (this.googleTimer) {

      clearTimeout(this.googleTimer);

    }

    this.destroy$.next();

    this.destroy$.complete();

    window.removeEventListener(
  'cart-updated',
  this.onCartUpdated
);
window.removeEventListener(
  'login-required',
  this.onLoginRequired
);
  }


openLoginModal(): void {
  this.googleError = '';
  this.loginModalOpen = true;
  this.profileMenuOpen = false;

  this.cdr.detectChanges();

  setTimeout(() => {
    this.initializeGoogle();
  }, 100);
}


closeLoginModal(): void {
  if (this.googleLoading) return;

  this.loginModalOpen = false;
  this.googleError = '';
}


}
