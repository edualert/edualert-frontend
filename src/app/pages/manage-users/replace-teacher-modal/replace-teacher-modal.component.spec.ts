import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceTeacherModalComponent } from './replace-teacher-modal.component';

describe('ReplaceTeacherModalComponent', () => {
  let component: ReplaceTeacherModalComponent;
  let fixture: ComponentFixture<ReplaceTeacherModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceTeacherModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceTeacherModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
