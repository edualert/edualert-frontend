import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClassProfilesComponent } from './manage-class-profiles.component';

describe('ManageClassProfilesComponent', () => {
  let component: ManageClassProfilesComponent;
  let fixture: ComponentFixture<ManageClassProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageClassProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageClassProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
