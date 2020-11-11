import {Component, Input, ViewChild, HostListener, OnDestroy} from '@angular/core';
import {ModalComponent} from "../../../shared/modal/modal.component";
import {DatepickerComponent} from '../../../shared/datepicker/datepicker.component';
import {CanComponentDeactivate} from '../../../services/can-leave-guard.service';
import {getCurrentAcademicYear} from '../../../shared/utils';
import {HttpClient} from "@angular/common/http";
import * as moment from 'moment';

@Component({
  selector: 'app-add-absences-bulk-modal',
  templateUrl: './add-absences-bulk-modal.component.html',
  styleUrls: ['./add-absences-bulk-modal.component.scss', '../../../shared/label-styles.scss']
})
export class AddAbsencesBulkModalComponent implements CanComponentDeactivate, OnDestroy {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @ViewChild('datepicker', {'static': true}) datepicker: DatepickerComponent;
  students: any[];
  classGrade: string;
  classLetter: string;
  currentDate: string = moment().format("DD-MM");
  isGloballySelected: boolean;
  hasModifiedData: boolean = false;
 
  constructor(private httpClient: HttpClient) { }

  saveAbsencesAction() {
  }

  open(modalData: BulkAddAbsencesModalData) : void {
    window.addEventListener('click', this.handleClick.bind(this));
    this.students = modalData.students.map(element => { return {...element, addedAbsences: []} });
    this.classGrade = modalData.classGrade;
    this.classLetter = modalData.classLetter;

    this.saveAbsencesAction = () => {
      const student_absences = [];
      this.students.forEach(studentData => {
        studentData.addedAbsences.forEach(is_founded => {
          student_absences.push({
            is_founded, 
            'student': studentData.student.id
          })
        })
      })

      modalData.saveAbsencesCallback({
        'taken_at': `${this.currentDate}-${moment().year()}`,
        student_absences
      });
      this.hasModifiedData = false;
      this.isGloballySelected = false;
    };
    this.modal.open();
    return;
  }

  close() : void {
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

  convertStringToDate(dateString) : Date {
    return moment(dateString, "DD-MM").toDate();
  }

  changeDate(value: string): void {
    this.currentDate = moment(value).format("DD-MM");
  }

  absenceChanged(event: any, studentIndex: number, absenceIndex: number) : void {
    event.stopPropagation();

    this.students[studentIndex].addedAbsences[absenceIndex] = !this.students[studentIndex].addedAbsences[absenceIndex];
  }

  addAbsenceForStudent(studentIndex: number, event: any = null) : void {
    if (event) {
      event.stopPropagation();
    }

    this.hasModifiedData = true;
    this.students[studentIndex].addedAbsences.push(false);
  }

  removeAbsenceForStudent(studentIndex: number, absenceIndex: number, event: any = null) : void {
    if (event) {
      event.stopPropagation();
    }

    this.students[studentIndex].addedAbsences.splice(absenceIndex, 1);

    if (this.isGloballySelected) {
      this.isGloballySelected = false;
    }
  }

  localAbsencesToggle(studentIndex: number) {
    if (this.students[studentIndex].addedAbsences.length) {
      this.students[studentIndex].addedAbsences = [];

      if (this.isGloballySelected) {
        this.isGloballySelected = false;
      }
    }
    else {
      this.students[studentIndex].addedAbsences.push(false);
      this.hasModifiedData = true;
    }
  }

  addAbsencesForAllStudents() {
    this.students.forEach((studentData, i) => {
      if (!this.students[i].addedAbsences.length) {
        this.addAbsenceForStudent(i);
      }
    })
  }

  removeAbsencesForAllStudents() {
    this.students.forEach(studentData => {
      studentData.addedAbsences = [];
    })
  }

  globalAbsencesToggle() {
    if (this.isGloballySelected) {
      this.removeAbsencesForAllStudents();
      this.isGloballySelected = false;
    }
    else {
      this.addAbsencesForAllStudents();
      this.isGloballySelected = true;
    }
  }

   @HostListener("window:beforeunload")
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

class BulkAddAbsencesModalData {
  classGrade: string;
  classLetter: string;
  students: any[];
  saveAbsencesCallback: any; // function
}
