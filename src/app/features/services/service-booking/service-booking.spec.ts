import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceBooking } from './service-booking';

describe('ServiceBooking', () => {
  let component: ServiceBooking;
  let fixture: ComponentFixture<ServiceBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
