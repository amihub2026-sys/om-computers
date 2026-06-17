import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Toast } from '../../../core/services/toast';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/interfaces/service.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-details.html',
  styleUrl: './service-details.css',
})
export class ServiceDetails implements OnInit, OnDestroy {

  service?: Service;
  isLoading = false;
  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/services']);
      return;
    }

    this.loadService(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadService(id: string): void {
    this.isLoading = true;

    this.serviceService.getServiceById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.service = res.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.toast.error('Service not found', 'Error');
          this.router.navigate(['/services']);
          this.cdr.detectChanges();
        }
      });
  }

  bookService(): void {
    if (!this.service?._id) {
      return;
    }

    this.toast.success(
      'Redirecting to service booking...',
      'Book Service'
    );

    this.router.navigate(['/service-booking', this.service._id]);
  }
}