import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PupilRemarksModalComponent } from './pupil-labels-modal.component';

describe('PupilLabelsModalComponent', () => {
  let component: PupilRemarksModalComponent;
  let fixture: ComponentFixture<PupilRemarksModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PupilRemarksModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PupilRemarksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
