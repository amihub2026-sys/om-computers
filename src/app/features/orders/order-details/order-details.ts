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
import { Order as OrderService } from '../../../core/services/order';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


import {
  OrderItem,
  OrderProduct
} from '../../../core/interfaces/order.interface';

import { APP_INFO } from '../../../core/constants/app.constants';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit, OnDestroy {

  order?: OrderItem;
  isLoading = false;
  imageBaseUrl = `${environment.baseUrl}/uploads/products/`;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private alert: AlertService,
    private toast: Toast,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getOrderDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.toast.error('Order ID not found.', 'Error');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.orderService.getOrderById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          if (res.success) {
            this.order = res.data;
          } else {
            this.toast.error(res.message, 'Error');
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load order details.', 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  get orderId(): string {
    return this.order?._id
      ? '#' + this.order._id.slice(-6).toUpperCase()
      : '';
  }

  get invoiceId(): string {
    return this.order?._id
      ? 'INV-' + this.order._id.slice(-6).toUpperCase()
      : '';
  }

  get canCancel(): boolean {
    return this.order?.orderStatus === 'Pending';
  }

  
getProductImage(image?: string): string {
  const fallback = '/assets/images/products/gaming-pc.jpg';

  if (!image || !image.trim()) {
    return fallback;
  }

  const path = image.trim();

  // Cloudflare R2 / full image URL
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Angular assets
  if (path.startsWith('/assets/')) {
    return path;
  }

  if (path.startsWith('assets/')) {
    return '/' + path;
  }

  // Backend uploads path
  if (path.startsWith('/uploads/')) {
    return environment.baseUrl.replace(/\/+$/, '') + path;
  }

  if (path.startsWith('uploads/')) {
    return environment.baseUrl.replace(/\/+$/, '') + '/' + path;
  }

  return this.imageBaseUrl + path;
}

onProductImageError(event: Event): void {
  const image = event.target as HTMLImageElement;
  const fallback = '/assets/images/products/gaming-pc.jpg';

  if (!image.src.endsWith(fallback)) {
    image.src = fallback;
  }
}

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Pending':
      case 'Confirmed':
        return 'processing';

      case 'Shipped':
        return 'shipped';

      case 'Delivered':
        return 'delivered';

      case 'Cancelled':
        return 'cancelled';

      default:
        return 'processing';
    }
  }

  cancelOrder(): void {
    if (!this.order) {
      return;
    }

    this.alert.confirm(
      'Cancel Order?',
      'Are you sure you want to cancel this order?',
      'Yes, Cancel',
      'No'
    ).then((result) => {

      if (!result.isConfirmed || !this.order) {
        return;
      }

      this.orderService.updateOrder(this.order._id, {
        orderStatus: 'Cancelled'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            if (res.success && this.order) {
              this.order.orderStatus = 'Cancelled';

              this.alert.success(
                'Order cancelled successfully.',
                'Cancelled'
              );
            } else {
              this.toast.error(res.message, 'Error');
            }

            this.cdr.detectChanges();
          },
          error: () => {
            this.toast.error('Failed to cancel order.', 'Error');
            this.cdr.detectChanges();
          }
        });

    });
  }

  
downloadInvoice(): void {
  if (!this.order) {
    this.toast.error('Order not found.', 'Error');
    return;
  }

  const order = this.order;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const right = pageWidth - margin;

  const money = (value: number): string =>
    `Rs. ${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const formatDate = (value: string | Date): string =>
    new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  // HEADER
  doc.setFillColor(14, 29, 58);
  doc.rect(0, 0, pageWidth, 49, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(23);
  doc.text(APP_INFO.COMPANY_NAME, margin, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Computer Sales & Services', margin, 28);

  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', right, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(this.invoiceId, right, 28, { align: 'right' });

  // COMPANY DETAILS
  doc.setTextColor(48, 58, 74);
  doc.setFontSize(9);

  let y = 58;

  const companyDetails = [
    APP_INFO.ADDRESS,
    `Phone: ${APP_INFO.PHONE}`,
    `Email: ${APP_INFO.EMAIL}`,
    `Website: ${APP_INFO.WEBSITE}`
  ];

  for (const detail of companyDetails) {
    const lines = doc.splitTextToSize(String(detail || ''), 175);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 1;
  }

  doc.setDrawColor(220, 226, 235);
  doc.line(margin, y + 2, right, y + 2);
  y += 12;

  // CUSTOMER INFORMATION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 29, 58);
  doc.text('BILL TO', margin, y);
  doc.text('ORDER INFORMATION', 115, y);

  y += 8;

  const customerLines = [
    order.customerName,
    order.phone,
    order.email || '',
    order.address
  ].filter(Boolean);

  const billToLines = customerLines.flatMap(value =>
    doc.splitTextToSize(String(value), 85) as string[]
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(65, 75, 90);

  let customerY = y;

  for (const line of billToLines) {
    doc.text(line, margin, customerY);
    customerY += 5;
  }

  const orderInfo = [
    `Order ID: ${this.orderId}`,

`Date: ${order.createdAt ? formatDate(order.createdAt) : '-'}`,

    `Order Status: ${order.orderStatus}`,
    `Payment Status: ${order.paymentStatus}`,
    `Payment: ${order.paymentMethod || '-'}`
  ];

  let infoY = y;

  for (const line of orderInfo) {
    doc.text(line, 115, infoY);
    infoY += 6;
  }

  y = Math.max(customerY, infoY) + 10;

  // PRODUCTS TABLE
  const tableBody = order.products.map((product, index) => [
    String(index + 1),
    product.productName,
    String(product.quantity),
    money(product.price),
    money(product.price * product.quantity)
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      'S.No',
      'Product Description',
      'Qty',
      'Unit Price',
      'Amount'
    ]],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      textColor: [40, 50, 65],
      lineColor: [226, 231, 238],
      lineWidth: 0.2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [246, 249, 253]
    },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' }
    },
    margin: {
      left: margin,
      right: margin,
      bottom: 30
    }
  });

  // SUMMARY
  const lastTable = (doc as any).lastAutoTable;
  let totalY = (lastTable?.finalY || y) + 12;

  if (totalY > 245) {
    doc.addPage();
    totalY = 25;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(65, 75, 90);

  doc.text('Subtotal', 130, totalY);
  doc.text(money(order.totalAmount), right, totalY, {
    align: 'right'
  });

  totalY += 8;

  doc.text('Delivery', 130, totalY);
  doc.text('Free', right, totalY, {
    align: 'right'
  });

  totalY += 5;

  doc.setDrawColor(200, 210, 225);
  doc.line(128, totalY, right, totalY);

  totalY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(14, 29, 58);

  doc.text('Grand Total', 130, totalY);
  doc.text(money(order.totalAmount), right, totalY, {
    align: 'right'
  });

  // FOOTER ON EVERY PAGE
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    const height = doc.internal.pageSize.getHeight();

    doc.setDrawColor(220, 226, 235);
    doc.line(margin, height - 24, right, height - 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 100, 115);

    doc.text(
      `Thank you for choosing ${APP_INFO.COMPANY_NAME}`,
      margin,
      height - 17
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      right,
      height - 17,
      { align: 'right' }
    );

    doc.setFontSize(8);
    doc.text(
      'Computer-generated order invoice.',
      margin,
      height - 11
    );
  }

  doc.save(`${this.invoiceId}.pdf`);

  this.alert.success(
    'Invoice PDF downloaded successfully.',
    'Downloaded'
  );
}


  trackByProduct(index: number, product: OrderProduct): string {
    return product.productName;
  }

}