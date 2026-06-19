import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonPagination } from './common-pagination';

describe('CommonPagination', () => {
  let component: CommonPagination;
  let fixture: ComponentFixture<CommonPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
