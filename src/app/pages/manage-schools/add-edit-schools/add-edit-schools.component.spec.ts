import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSchoolsComponent } from './add-edit-schools.component';

describe('AddEditSchoolsComponent', () => {
  let component: AddEditSchoolsComponent;
  let fixture: ComponentFixture<AddEditSchoolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditSchoolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSchoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
