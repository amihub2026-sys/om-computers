import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  environment
} from '../../../environments/environment';

import {
  Contact
} from '../../core/interfaces/contact.interface';


@Component({
  selector: 'app-manage-contacts',
  standalone: true,

  imports: [
    CommonModule,
    HttpClientModule
  ],

  templateUrl: './manage-contacts.html',
  styleUrl: './manage-contacts.css'
})
export class ManageContactsComponent implements OnInit {

  contacts: Contact[] = [];

  loading = false;

  deletingId: string | null = null;


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadContacts();

  }


  // ==========================================
  // LOAD ENQUIRIES
  // ==========================================

  loadContacts(): void {

    this.loading = true;

    this.cdr.detectChanges();


    this.http
      .get<any>(
        `${environment.baseUrl}/api/contacts`
      )
      .subscribe({

        next: (res) => {

          this.contacts =
            res.data || [];

          this.loading = false;


          // IMPORTANT
          this.cdr.detectChanges();

        },


        error: (err) => {

          console.error(
            'Error loading contacts:',
            err
          );

          this.contacts = [];

          this.loading = false;


          // IMPORTANT
          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // DELETE ENQUIRY
  // ==========================================

  deleteContact(
    id: string
  ): void {

    if (
      !confirm(
        'Delete this enquiry?'
      )
    ) {

      return;

    }


    this.deletingId = id;

    this.cdr.detectChanges();


    this.http
      .delete<any>(
        `${environment.baseUrl}/api/contacts/${id}`
      )
      .subscribe({

        next: () => {

          this.contacts =
            this.contacts.filter(
              contact =>
                contact._id !== id
            );


          this.deletingId = null;


          // IMPORTANT
          this.cdr.detectChanges();


          alert(
            'Enquiry deleted successfully'
          );

        },


        error: (err) => {

          console.error(
            'Delete failed:',
            err
          );


          this.deletingId = null;


          // IMPORTANT
          this.cdr.detectChanges();


          alert(
            'Failed to delete enquiry'
          );

        }

      });

  }

}