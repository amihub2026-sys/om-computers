import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Contact } from '../../core/interfaces/contact.interface';

@Component({
  selector: 'app-manage-contacts',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './manage-contacts.html',
  styleUrl: './manage-contacts.css'
})
export class ManageContactsComponent implements OnInit {

  contacts: Contact[] = [];
  loading = false;
  deletingId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;

    this.http.get<any>(`${environment.baseUrl}/api/contacts`)
      .subscribe({
        next: (res) => {
          this.contacts = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading contacts:', err);
          this.loading = false;
        }
      });
  }

  deleteContact(id: string): void {
    if (!confirm('Delete this enquiry?')) {
      return;
    }

    this.deletingId = id;

    this.http.delete<any>(`${environment.baseUrl}/api/contacts/${id}`)
      .subscribe({
        next: () => {
          this.contacts = this.contacts.filter(contact => contact._id !== id);
          this.deletingId = null;
          alert('Enquiry deleted successfully');
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.deletingId = null;
          alert('Failed to delete enquiry');
        }
      });
  }
}