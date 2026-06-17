import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('productsContainer') productsContainer!: ElementRef;

  products: Product[] = [];
  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;
  isLoading = true;

  activeCard: number | null = null;
  intervalId: any;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = (res.data || []).slice(0, 6);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.intervalId = setInterval(() => {
      this.autoSlide();
    }, 3000);
  }

  autoSlide() {
    if (!this.productsContainer) return;

    const container = this.productsContainer.nativeElement;
    const cardWidth = 270;

    container.scrollLeft += cardWidth;

    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
      container.scrollLeft = 0;
    }
  }

  trackByProduct(index: number, product: Product): string | undefined {
    return product._id;
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}