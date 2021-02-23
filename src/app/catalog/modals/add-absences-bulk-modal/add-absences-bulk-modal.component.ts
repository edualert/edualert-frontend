import {Component, ViewChild, HostListener, OnDestroy, Input} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {DatepickerComponent} from '../../../shared/datepicker/datepicker.component';
import {CanComponentDeactivate} from '../../../services/can-leave-guard.service';
import * as moment from 'moment';
import {AcademicYearCalendar} from '../../../models/academic-year-calendar';
import {getCurrentSemesterStartDate} from '../../../shared/utils';

@Component({
  selector: 'app-add-absences-bulk-modal',
  templateUrl: './add-absences-bulk-modal.component.html',
  styleUrls: ['./add-absences-bulk-modal.component.scss', '../../../shared/label-styles.scss']
})
export class AddAbsencesBulkModalComponent implements CanComponentDeactivate, OnDestroy {
  @Input() academicYearCalendar: AcademicYearCalendar;
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @ViewChild('datepicker', {'static': true}) datepicker: DatepickerComponent;
  students: any[];
  classGrade: string;
  classLetter: string;
  selectedDate: Date;
  today: Date;
  isGloballySelected: boolean;
  hasModifiedData: boolean = false;
  currentSemesterStartDate: Date;
  absencesAddedCount: number = 0;

  constructor() {
    this.today = new Date();
  }

  saveAbsencesAction() {
  }

  open(modalData: BulkAddAbsencesModalData): void {
    this.absencesAddedCount = 0;
    this.selectedDate = this.today;
    window.addEventListener('click', this.handleClick.bind(this));
    this.students = modalData.students.map(element => {
      return {...element, addedAbsences: []};
    });
    this.classGrade = modalData.classGrade;
    this.classLetter = modalData.classLetter;

    this.saveAbsencesAction = () => {
      const student_absences = [];
      this.students.forEach(studentData => {
        studentData.addedAbsences.forEach(is_founded => {
          student_absences.push({
            is_founded,
            'student': studentData.student.id
          });
        });
      });

      modalData.saveAbsencesCallback({
        'taken_at': `${moment(this.selectedDate).format('DD-MM-YYYY')}`,
        student_absences
      });
      this.hasModifiedData = false;
      this.isGloballySelected = false;
    };
    this.currentSemesterStartDate = getCurrentSemesterStartDate(this.academicYearCalendar);
    this.modal.open();
    return;
  }

  close(): void {
    if (this.canDeactivate()) {
      this.hasModifiedData = false;
      this.isGloballySelected = false;
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

  absenceChanged(event: any, studentIndex: number, absenceIndex: number): void {
    event.stopPropagation();

    this.students[studentIndex].addedAbsences[absenceIndex] = !this.students[studentIndex].addedAbsences[absenceIndex];
  }

  addAbsenceForStudent(studentIndex: number, event: any = null): void {
    if (event) {
      event.stopPropagation();
    }

    this.hasModifiedData = true;
    this.students[studentIndex].addedAbsences.push(false);
    this.absencesAddedCount++;
  }

  removeAbsenceForStudent(studentIndex: number, absenceIndex: number, event: any = null): void {
    if (event) {
      event.stopPropagation();
    }

    this.students[studentIndex].addedAbsences.splice(absenceIndex, 1);

    if (this.isGloballySelected) {
      this.isGloballySelected = false;
    }
    this.absencesAddedCount--;
    this.hasModifiedData = this.absencesAddedCount !== 0;
  }

  localAbsencesToggle(studentIndex: number) {
    if (this.students[studentIndex].addedAbsences.length) {
      this.absencesAddedCount = this.absencesAddedCount - this.students[studentIndex].addedAbsences.length;
      this.students[studentIndex].addedAbsences = [];

      if (this.isGloballySelected) {
        this.isGloballySelected = false;
      }
    } else {
      this.students[studentIndex].addedAbsences.push(false);
      this.absencesAddedCount++;
    }
    this.hasModifiedData = this.absencesAddedCount !== 0;
  }

  addAbsencesForAllStudents() {
    this.students.forEach((studentData, i) => {
      if (!this.students[i].addedAbsences.length) {
        this.addAbsenceForStudent(i);
      }
    });
  }

  removeAbsencesForAllStudents() {
    this.students.forEach(studentData => {
      this.absencesAddedCount = this.absencesAddedCount - studentData.addedAbsences.length;
      studentData.addedAbsences = [];
    });
  }

  globalAbsencesToggle() {
    if (this.isGloballySelected) {
      this.removeAbsencesForAllStudents();
      this.isGloballySelected = false;
    } else {
      this.addAbsencesForAllStudents();
      this.isGloballySelected = true;
    }
    this.hasModifiedData = this.absencesAddedCount !== 0;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    if (this.hasModifiedData) {
      return confirm('Doriți să continuați? Datele introduse vor fi pierdute.');
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

class BulkAddAbsencesModalData {
  classGrade: string;
  classLetter: string;
  students: any[];
  saveAbsencesCallback: any; // function
}
