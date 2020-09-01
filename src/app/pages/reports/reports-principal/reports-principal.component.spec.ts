import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsPrincipalComponent } from './reports-principal.component';

describe('ReportsPrincipalComponent', () => {
  let component: ReportsPrincipalComponent;
  let fixture: ComponentFixture<ReportsPrincipalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsPrincipalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
