import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUsersBulkComponent } from './add-users-bulk.component';

describe('AddUsersBulkComponent', () => {
  let component: AddUsersBulkComponent;
  let fixture: ComponentFixture<AddUsersBulkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUsersBulkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUsersBulkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
