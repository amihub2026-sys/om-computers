import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../core/interfaces/service.interface';

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-service.html',
  styleUrl: './add-service.css',
})
export class AddService implements OnInit, OnDestroy {

  service: Service = {
    name: '',
    category: '',
    price: 0,
    duration: '',
    description: '',
    image: ''
  };

  selectedImage: File | null = null;
  serviceId: string | null = null;
  isEditMode = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private serviceService: ServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');

    if (this.serviceId) {
      this.isEditMode = true;
      this.loadService(this.serviceId);
    }
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
          alert('Failed to load service');
          this.router.navigate(['/admin/services']);
          this.cdr.detectChanges();
        }
      });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  saveService(): void {
    const formData = new FormData();

    formData.append('name', this.service.name);
    formData.append('category', this.service.category);
    formData.append('price', String(this.service.price));
    formData.append('duration', this.service.duration || '');
    formData.append('description', this.service.description || '');

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.isEditMode && this.serviceId) {
      this.updateService(formData);
    } else {
      this.createService(formData);
    }
  }

  private createService(formData: FormData): void {
    this.serviceService.addService(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Service saved successfully');
          this.router.navigate(['/admin/services']);
        },
        error: (err) => {
          console.error(err);
          alert('Service save failed');
        }
      });
  }

  private updateService(formData: FormData): void {
    if (!this.serviceId) return;

    this.serviceService.updateService(this.serviceId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Service updated successfully');
          this.router.navigate(['/admin/services']);
        },
        error: (err) => {
          console.error(err);
          alert('Service update failed');
        }
      });
  }
}