import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/interfaces/service.interface';
import { environment } from '../../../../environments/environment';
import { CommonSearchBar } from '../../../shared/components/common-search-bar/common-search-bar';
import { CommonPagination } from '../../../shared/components/common-pagination/common-pagination';
@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommonSearchBar, CommonPagination],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList implements OnInit, OnDestroy {

  services: Service[] = [];
  isLoading = false;
  showFilters = false;
  searchText = '';

  selectedCategories: string[] = [];
  maxPrice = 0;
  priceLimit = 0;

  categories: string[] = [];
  currentPage = 1;
  pageSize = 6;

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

          this.categories = [
            ...new Set(
              this.services
                .map(service => service.category)
                .filter(Boolean)
            )
          ];

          this.priceLimit = this.services.length
            ? Math.max(...this.services.map(service => Number(service.price || 0)))
            : 0;

          this.maxPrice = this.priceLimit;

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.services = [];
          this.categories = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get filteredServices(): Service[] {
    const search = this.searchText.toLowerCase().trim();

    return this.services.filter(service => {
      const searchMatch =
        !search ||
        service.name.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search) ||
        (service.description || '').toLowerCase().includes(search);

      const categoryMatch =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(service.category);

      const priceMatch =
        this.maxPrice === 0 ||
        Number(service.price || 0) <= Number(this.maxPrice);

      return searchMatch && categoryMatch && priceMatch;
    });
  }
    
  get paginatedServices(): Service[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredServices.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.filteredServices.length / this.pageSize);
}

changePage(page: number): void {
  this.currentPage = page;
}


  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);

    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  trackByService(index: number, service: Service): string | undefined {
    return service._id;
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedCategories = [];
    this.maxPrice = this.priceLimit;
    this.showFilters = false;
  }

  applyFilters(): void {
    this.showFilters = false;
  }
}