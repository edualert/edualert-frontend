import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsOrsComponent } from './reports-ors.component';

describe('ReportsOrsComponent', () => {
  let component: ReportsOrsComponent;
  let fixture: ComponentFixture<ReportsOrsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsOrsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsOrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
