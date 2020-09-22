import {Component, ViewChild} from '@angular/core';
import {ModalComponent} from '../../shared/modal/modal.component';
import {IdText} from '../../models/id-text';

@Component({
  selector: 'app-pupil-remarks-modal',
  templateUrl: './pupil-remarks-modal.component.html',
  styleUrls: ['./pupil-remarks-modal.component.scss']
})
export class PupilRemarksModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  value: string = '';
  error: string = '';

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

  submit(): void {

  }

  handleChange(e: any) {
    if (e.target.textLength > 500) {
      this.error = ' ';
    } else if (e.target.textLength < 500 && this.error) {
      this.error = null;
    }
  }
}
