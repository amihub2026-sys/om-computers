
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  RouterModule,
  ActivatedRoute
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { Order as OrderService } from '../../../core/services/order';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css'
})
export class OrderSuccess implements OnInit {

  orderId = '';
  orderStatus = '';

  isLoading = true;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('orderId');

    if (!id) {
      this.isLoading = false;
      this.hasError = true;
      this.cdr.detectChanges();
      return;
    }

    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.success && res.data?._id) {
          this.orderId = res.data._id;
          this.orderStatus = res.data.orderStatus;
          this.hasError = false;
        } else {
          this.hasError = true;
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Order verification failed:', err);

        this.isLoading = false;
        this.hasError = true;

        this.cdr.detectChanges();
      }
    });
  }
}
