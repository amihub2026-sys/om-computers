import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSearchBar } from './common-search-bar';

describe('CommonSearchBar', () => {
  let component: CommonSearchBar;
  let fixture: ComponentFixture<CommonSearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonSearchBar],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonSearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
