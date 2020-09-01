import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesStudentParentComponent } from './messages-student-parent.component';

describe('MessagesStudentComponent', () => {
  let component: MessagesStudentParentComponent;
  let fixture: ComponentFixture<MessagesStudentParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesStudentParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesStudentParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
