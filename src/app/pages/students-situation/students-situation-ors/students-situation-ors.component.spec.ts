import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsSituationOrsComponent } from './students-situation-ors.component';

describe('StudentsSituationOrsComponent', () => {
  let component: StudentsSituationOrsComponent;
  let fixture: ComponentFixture<StudentsSituationOrsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsSituationOrsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsSituationOrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
