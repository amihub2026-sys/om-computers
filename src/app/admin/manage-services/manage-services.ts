import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../core/interfaces/service.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-services.html',
  styleUrl: './manage-services.css',
})
export class ManageServices implements OnInit, OnDestroy {

  services: Service[] = [];
  isLoading = false;

  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;

  private destroy$ = new Subject<void>();

  constructor(
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices(): void {
    this.isLoading = true;

    this.serviceService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.services = res.data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.services = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  trackByService(index: number, service: Service): string | undefined {
    return service._id;
  }

  deleteService(id?: string): void {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    this.serviceService.deleteService(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Service deleted successfully');
          this.loadServices();
        },
        error: (err) => {
          console.error(err);
          alert('Service delete failed');
        }
      });
  }
}