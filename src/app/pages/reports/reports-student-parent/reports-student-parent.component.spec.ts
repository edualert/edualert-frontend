import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsStudentParentComponent } from './reports-student-parent.component';

describe('ReportsStudentParentComponent', () => {
  let component: ReportsStudentParentComponent;
  let fixture: ComponentFixture<ReportsStudentParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsStudentParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsStudentParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
