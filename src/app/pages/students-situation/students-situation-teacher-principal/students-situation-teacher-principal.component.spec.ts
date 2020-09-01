import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsSituationTeacherPrincipalComponent } from './students-situation-teacher-principal.component';

describe('StudentsSituationTeacherPrincipalComponent', () => {
  let component: StudentsSituationTeacherPrincipalComponent;
  let fixture: ComponentFixture<StudentsSituationTeacherPrincipalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsSituationTeacherPrincipalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsSituationTeacherPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
