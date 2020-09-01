import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsSituationComponent } from './students-situation.component';

describe('StudentsSituationComponent', () => {
  let component: StudentsSituationComponent;
  let fixture: ComponentFixture<StudentsSituationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsSituationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsSituationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
