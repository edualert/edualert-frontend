import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsTeacherComponent } from './reports-teacher.component';

describe('ReportsTeacherComponent', () => {
  let component: ReportsTeacherComponent;
  let fixture: ComponentFixture<ReportsTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
