import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PupilLabelsModalComponent } from './pupil-labels-modal.component';

describe('PupilLabelsModalComponent', () => {
  let component: PupilLabelsModalComponent;
  let fixture: ComponentFixture<PupilLabelsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PupilLabelsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PupilLabelsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
