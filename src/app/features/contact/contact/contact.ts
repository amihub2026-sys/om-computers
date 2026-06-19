import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  isSending = false;

  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: ''
  };

  constructor(private http: HttpClient) {}

  sendMessage(): void {
    if (
      !this.contactForm.name ||
      !this.contactForm.email ||
      !this.contactForm.message
    ) {
      alert('Please fill name, email and message');
      return;
    }

    this.isSending = true;

    this.http.post(`${environment.baseUrl}/api/contacts`, this.contactForm)
      .subscribe({
        next: () => {
          alert('Message sent successfully');

          this.contactForm = {
            name: '',
            email: '',
            phone: '',
            subject: 'General Enquiry',
            message: ''
          };

          this.isSending = false;
        },
        error: (err) => {
          console.error(err);
          alert('Failed to send message');
          this.isSending = false;
        }
      });
  }
}