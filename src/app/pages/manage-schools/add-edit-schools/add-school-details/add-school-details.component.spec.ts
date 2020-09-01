import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchoolDetailsComponent } from './add-school-details.component';

describe('AddSchoolDetailsComponent', () => {
  let component: AddSchoolDetailsComponent;
  let fixture: ComponentFixture<AddSchoolDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSchoolDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSchoolDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
