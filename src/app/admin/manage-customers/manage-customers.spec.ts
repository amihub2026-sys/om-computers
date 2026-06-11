import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomers } from './manage-customers';

describe('ManageCustomers', () => {
  let component: ManageCustomers;
  let fixture: ComponentFixture<ManageCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCustomers],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCustomers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
