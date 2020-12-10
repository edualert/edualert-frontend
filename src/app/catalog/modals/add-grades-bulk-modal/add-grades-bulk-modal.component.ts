import {Component, ViewChild, HostListener, OnDestroy} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {DatepickerComponent} from '../../../shared/datepicker/datepicker.component';
import {CanComponentDeactivate} from '../../../services/can-leave-guard.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-grades-bulk-modal',
  templateUrl: './add-grades-bulk-modal.component.html',
  styleUrls: ['./add-grades-bulk-modal.component.scss', '../../../shared/label-styles.scss']
})
export class AddGradesBulkModalComponent implements CanComponentDeactivate, OnDestroy {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @ViewChild('datepicker', {'static': true}) datepicker: DatepickerComponent;
  students: any[];
  classGrade: string;
  classLetter: string;
  selectedDate: Date;
  today: Date;
  availableGrades: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  hasModifiedData: boolean = false;

  constructor() {
    this.today = new Date();
  }

  saveGradesAction() {
  }

  open(modalData: BulkAddGradesModalData): void {
    this.selectedDate = this.today;
    window.addEventListener('click', this.handleClick.bind(this));
    this.students = modalData.students.map(element => {
      return {...element, addedGrades: []};
    });
    this.classGrade = modalData.classGrade;
    this.classLetter = modalData.classLetter;

    this.saveGradesAction = () => {
      const student_grades = [];
      this.students.forEach(studentData => {
        studentData.addedGrades.forEach(grade => {
          student_grades.push({
            grade,
            'student': studentData.student.id
          });
        });
      });

      modalData.saveGradesCallback({
        'taken_at': `${moment(this.selectedDate).format('DD-MM-YYYY')}`,
        student_grades
      });
      this.hasModifiedData = false;
    };
    this.modal.open();
    return;
  }

  close(): void {
    if (this.canDeactivate()) {
      this.hasModifiedData = false;
      window.removeEventListener('click', this.handleClick);
      this.modal.close();
    }
    return;
  }

  openPicker() {
    this.datepicker.open();
  }

  changeDate(date: Date): void {
    this.selectedDate = date;
  }

  displayDate(date: Date): string {
    if (date) {
      return moment(date).format('DD.MM');
    }
    return '';
  }

  gradeDropdownChanged(event: { element, index }, studentIndex: number, gradeIndex: number): void {
    this.students[studentIndex].addedGrades[gradeIndex] = event.element;
  }

  addGradeForStudent(event: any, studentIndex: number): void {
    event.stopPropagation();

    this.hasModifiedData = true;
    this.students[studentIndex].addedGrades.push(10);
  }

  removeGradeForStudent(event: any, studentIndex: number, gradeIndex: number): void {
    event.stopPropagation();

    this.students[studentIndex].addedGrades.splice(gradeIndex, 1);
  }

  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    if (this.hasModifiedData) {
      if (confirm('Doriti sa continuati? Datele introduse vor fi pierdute.')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  handleClick(event): void {
    if (!this.modal.root.nativeElement.contains(event.target as HTMLElement) && this.hasModifiedData) {
      event.stopPropagation();
      this.close();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.handleClick);
  }
}

class BulkAddGradesModalData {
  classGrade: string;
  classLetter: string;
  students: any[];
  saveGradesCallback: any; // function
}
