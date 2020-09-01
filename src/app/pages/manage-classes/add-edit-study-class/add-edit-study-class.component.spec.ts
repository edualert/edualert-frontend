import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStudyClassComponent } from './add-edit-study-class.component';

describe('AddEditStudyClassComponent', () => {
  let component: AddEditStudyClassComponent;
  let fixture: ComponentFixture<AddEditStudyClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditStudyClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditStudyClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
