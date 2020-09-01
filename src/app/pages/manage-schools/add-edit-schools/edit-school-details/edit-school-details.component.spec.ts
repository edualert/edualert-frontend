import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSchoolDetailsComponent } from './edit-school-details.component';

describe('EditSchoolDetailsComponent', () => {
  let component: EditSchoolDetailsComponent;
  let fixture: ComponentFixture<EditSchoolDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSchoolDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSchoolDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
