import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageContacts } from './manage-contacts';

describe('ManageContacts', () => {
  let component: ManageContacts;
  let fixture: ComponentFixture<ManageContacts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageContacts],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageContacts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
