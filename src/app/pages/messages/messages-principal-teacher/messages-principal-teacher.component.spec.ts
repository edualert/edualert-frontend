import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesPrincipalTeacherComponent } from './messages-principal-teacher.component';

describe('MessagesPrincipalComponent', () => {
  let component: MessagesPrincipalTeacherComponent;
  let fixture: ComponentFixture<MessagesPrincipalTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesPrincipalTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesPrincipalTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
