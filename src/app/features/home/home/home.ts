import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  @ViewChild('productsContainer')
  productsContainer!: ElementRef<HTMLDivElement>;

  scrollLeft(): void {
    this.productsContainer.nativeElement.scrollBy({
      left: -350,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    this.productsContainer.nativeElement.scrollBy({
      left: 350,
      behavior: 'smooth'
    });
  }

}