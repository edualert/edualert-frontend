import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {ModalComponent} from '../../shared/modal/modal.component';
import {IdText} from '../../models/id-text';
import {StudentRemarksService} from '../../services/student-remarks.service';

@Component({
  selector: 'app-pupil-remarks-modal',
  templateUrl: './pupil-remarks-modal.component.html',
  styleUrls: ['./pupil-remarks-modal.component.scss']
})
export class PupilRemarksModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  updateRemarkObject = {
    remark: '',
    id: null
  };
  currentCatalog: string;

  value: string = '';
  error: string = '';

  labels: IdText[];
  studentName: string;

  constructor(private studentRemarksService: StudentRemarksService) {
  }

  close() {
    this.modal.close();
    this.value = '';
  }

  open(studentData, studentCatalogId, tableLayout) {
    this.currentCatalog = tableLayout;
    this.studentName = studentData?.full_name;
    this.updateRemarkObject.id = studentCatalogId;
    this.getStudentRemarks();
    this.modal.open();
  }

  submit(): void {
    this.updateRemarkObject.remark = this.value;
    this.updateStudentRemarks(this.updateRemarkObject);
    this.modal.close();
  }

  handleChange(e: any) {
    if (e.target.textLength > 500) {
      this.error = ' ';
      return;
    } else if (e.target.textLength <= 500 && this.error) {
      this.error = null;
    }
  }

  updateStudentRemarks(studentData) {
    if (['class_students', 'students_situation_ors', 'students_situation_teacher_principal'].includes(this.currentCatalog)) {
      this.studentRemarksService.updateRemarksPerYear(studentData.id, {'remarks': studentData.remark}).subscribe();
    } else {
      this.studentRemarksService.updateRemarksPerSubject(studentData.id, {'remarks': studentData.remark}).subscribe();
    }
  }

  getStudentRemarks() {
    if (['class_students', 'students_situation_ors', 'students_situation_teacher_principal'].includes(this.currentCatalog)) {
      this.studentRemarksService.getRemarksPerYear(this.updateRemarkObject.id).subscribe(response => {
        this.value = response?.remarks;
      });
    } else {
      this.studentRemarksService.getRemarksPerSubject(this.updateRemarkObject.id).subscribe(response => {
        this.value = response?.remarks;
      });
    }
  }
}
