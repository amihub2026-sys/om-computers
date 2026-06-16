import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],   // ✅ THIS FIXES routerLink
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {

  @ViewChild('productsContainer') productsContainer!: ElementRef;
   activeCard: number | null = null;
  intervalId: any;

  ngAfterViewInit() {
    this.intervalId = setInterval(() => {
      this.autoSlide();
    }, 3000);
  }

  autoSlide() {
    const container = this.productsContainer.nativeElement;
    const cardWidth = 320;

    container.scrollLeft += cardWidth;

    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
      container.scrollLeft = 0;
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}