import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStudyYearComponent } from './edit-study-year.component';

describe('EditStudyYearComponent', () => {
  let component: EditStudyYearComponent;
  let fixture: ComponentFixture<EditStudyYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStudyYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStudyYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
