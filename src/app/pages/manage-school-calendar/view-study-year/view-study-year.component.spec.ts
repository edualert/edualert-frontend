import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStudyYearComponent } from './view-study-year.component';

describe('ViewStudyYearComponent', () => {
  let component: ViewStudyYearComponent;
  let fixture: ComponentFixture<ViewStudyYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewStudyYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewStudyYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
