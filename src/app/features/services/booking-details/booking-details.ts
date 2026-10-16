import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AlertService } from '../../../core/services/alert';
import { Toast } from '../../../core/services/toast';
import { BookingService } from '../../../core/services/booking.service';
import {
  Booking,
  SingleBookingResponse
} from '../../../core/interfaces/booking.interface';

import { jsPDF } from 'jspdf';
import { APP_INFO } from '../../../core/constants/app.constants';


@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.css',
})
export class BookingDetails implements OnInit, OnDestroy {

  booking?: Booking;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private alert: AlertService,
    private toast: Toast,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBooking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooking(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.toast.error('Booking ID not found', 'Error');
      return;
    }

    this.isLoading = true;

    this.bookingService.getBookingById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: SingleBookingResponse) => {
          this.booking = res.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.toast.error('Failed to load booking', 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  get bookingId(): string {
    return this.booking?._id
      ? '#' + this.booking._id.slice(-6).toUpperCase()
      : '';
  }

  
downloadReceipt(): void {
  if (!this.booking) {
    this.toast.error('Booking not found', 'Error');
    return;
  }

  const booking = this.booking;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = pdf.internal.pageSize.getWidth();
  const margin = 18;
  const right = width - margin;
  const receiptId = `BR-${booking._id.slice(-6).toUpperCase()}`;

  const safe = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  };

  // Header
  pdf.setFillColor(15, 27, 50);
  pdf.rect(0, 0, width, 48, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.text(APP_INFO.COMPANY_NAME, margin, 19);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Computer Sales & Services', margin, 27);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('BOOKING RECEIPT', right, 19, {
    align: 'right'
  });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receiptId, right, 27, {
    align: 'right'
  });

  // Company information
  let y = 58;

  pdf.setTextColor(65, 75, 90);
  pdf.setFontSize(9);

  const companyLines = [
    APP_INFO.ADDRESS,
    `Phone: ${APP_INFO.PHONE}`,
    `Email: ${APP_INFO.EMAIL}`,
    `Website: ${APP_INFO.WEBSITE}`
  ];

  for (const line of companyLines) {
    const wrapped = pdf.splitTextToSize(safe(line), 172);
    pdf.text(wrapped, margin, y);
    y += wrapped.length * 5;
  }

  y += 5;

  pdf.setDrawColor(215, 225, 238);
  pdf.line(margin, y, right, y);
  y += 12;

  pdf.setTextColor(15, 27, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('CUSTOMER DETAILS', margin, y);
  pdf.text('BOOKING DETAILS', 110, y);

  y += 9;

  const customer = [
    `Name: ${safe(booking.customerName)}`,
    `Phone: ${safe(booking.phone)}`,
    `Email: ${safe(booking.email)}`
  ];

  const details = [
    `Booking ID: #${booking._id.slice(-6).toUpperCase()}`,
    `Service: ${safe(booking.serviceName)}`,
    `Date: ${safe(booking.bookingDate)}`,
    `Status: ${safe(booking.status)}`
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(52, 64, 82);

  let leftY = y;

  for (const line of customer) {
    const wrapped = pdf.splitTextToSize(line, 82);
    pdf.text(wrapped, margin, leftY);
    leftY += wrapped.length * 5 + 2;
  }

  let rightY = y;

  for (const line of details) {
    const wrapped = pdf.splitTextToSize(line, 80);
    pdf.text(wrapped, 110, rightY);
    rightY += wrapped.length * 5 + 2;
  }

  y = Math.max(leftY, rightY) + 14;

  // Information note
  pdf.setFillColor(242, 246, 253);
  pdf.roundedRect(margin, y, width - margin * 2, 27, 3, 3, 'F');

  pdf.setTextColor(15, 27, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Booking Confirmation Record', margin + 6, y + 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(
    'This document confirms that a service request was recorded.',
    margin + 6,
    y + 17
  );

  pdf.text(
    'It is not proof of payment or service completion.',
    margin + 6,
    y + 23
  );

  // Footer
  const height = pdf.internal.pageSize.getHeight();

  pdf.setDrawColor(220, 226, 235);
  pdf.line(margin, height - 28, right, height - 28);

  pdf.setFontSize(9);
  pdf.setTextColor(80, 90, 105);

  pdf.text(
    `Thank you for choosing ${APP_INFO.COMPANY_NAME}`,
    margin,
    height - 20
  );

  pdf.setFontSize(8);
  pdf.text(
    'Computer-generated booking receipt.',
    margin,
    height - 13
  );

  pdf.save(`${receiptId}.pdf`);

  this.toast.success(
    'Booking receipt downloaded successfully!',
    'Downloaded'
  );
}


  cancelBooking(): void {
    if (!this.booking?._id) return;

    this.alert.confirm(
      'Cancel Booking?',
      'Are you sure you want to cancel this booking?',
      'Yes, Cancel',
      'No'
    ).then((result) => {
      if (!result.isConfirmed || !this.booking?._id) return;

      this.bookingService.updateBooking(this.booking._id, {
        status: 'Cancelled'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: SingleBookingResponse) => {
            if (res.success && this.booking) {
              this.booking.status = 'Cancelled';
              this.toast.success('Booking cancelled successfully!', 'Cancelled');
              this.cdr.detectChanges();
            } else {
              this.toast.error(res.message || 'Cancel failed', 'Error');
            }
          },
          error: (err) => {
            console.error(err);
            this.toast.error('Cancel failed', 'Error');
          }
        });
    });
  }
}