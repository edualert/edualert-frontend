import {Component, ViewChild} from '@angular/core';
import {ModalComponent} from '../../shared/modal/modal.component';
import {IdText} from '../../models/id-text';

@Component({
  selector: 'app-pupil-labels-modal',
  templateUrl: './pupil-labels-modal.component.html',
  styleUrls: ['./pupil-labels-modal.component.scss']
})
export class PupilLabelsModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;

  labels: IdText[];
  studentName: string;

  close() {
    this.modal.close();
  }

  open(studentData) {
    this.labels = studentData.labels;
    this.studentName = studentData.full_name;
    this.modal.open();
  }

}
