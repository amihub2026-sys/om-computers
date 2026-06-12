import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../../core/services/alert';
@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
    constructor(private alert: AlertService) {}
  orderStatus = 'Processing';

cancelOrder() {
  this.alert.confirm(
    'Cancel Order?',
    'Are you sure you want to cancel this order?',
    'Yes, Cancel',
    'No'
  ).then((result) => {

    if (result.isConfirmed) {
      this.orderStatus = 'Cancelled';

      this.alert.success(
        'Order cancelled successfully.',
        'Cancelled'
      );
    }

  });
}

downloadInvoice() {
  const invoiceContent = `
OM COMPUTERS
----------------------------------

Invoice No : INV-OM1001

Order ID   : #OM1001
Date       : 12 Jun 2026

Customer   : John Doe
Phone      : +91 98765 43210

----------------------------------

Product    : Gaming Desktop PC
Quantity   : 1
Price      : ₹45,999

----------------------------------

Subtotal   : ₹45,999
Delivery   : Free

Total      : ₹45,999

----------------------------------

Thank you for shopping with
OM Computers.

www.omcomputers.com
`;

  const blob = new Blob([invoiceContent], {
    type: 'text/plain'
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'Invoice_OM1001.txt';
  a.click();

  window.URL.revokeObjectURL(url);
  this.alert.success(
  'Invoice downloaded successfully.',
  'Downloaded'
);
}
}