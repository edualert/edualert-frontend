import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CellIdentifier } from '../../models/catalog-layouts';
import * as moment from 'moment';
import { SingleGradeOverlayComponent } from '../single-grade-overlay/single-grade-overlay.component';
import { SingleAbsenceOverlayComponent } from '../single-absence-overlay/single-absence-overlay.component';
import { Absence, Grade } from '../../models/student-grade-absence';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { AcademicYearCalendar } from '../../models/academic-year-calendar';
import { getCurrentSemesterStartDate } from '../../shared/utils';

@Component({
  selector: 'app-expanded-cell',
  templateUrl: './expanded-cell.component.html',
  styleUrls: ['./expanded-cell.component.scss']
})
export class ExpandedCellComponent implements OnInit {
  @Input() data: any;
  @Input() identifier: CellIdentifier;
  @Input() isEditable: boolean;

  @Input() isClassMaster: boolean = false;
  @Input() tableLayoutAsIdentifier: string;
  @Input() loggedUserRole: string;
  @Input() academicYearCalendar: AcademicYearCalendar;
  @Input() shouldDisplaySecondExaminationSection?: boolean = false;
  @Input() shouldDisplayDifferencesSection?: boolean = false;
  @Input() eventMinDate: Date;
  @Output() addGrade: EventEmitter<{ selectedGrade: number, selectedDate: Date, id: number }> = new EventEmitter<{ selectedGrade: number, selectedDate: Date, id: number }>();
  @Output() addAbsence: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteGrade: EventEmitter<Grade> = new EventEmitter<Grade>();
  @Output() deleteAbsence: EventEmitter<Absence> = new EventEmitter<Absence>();
  @Output() authorizeAbsence: EventEmitter<Absence> = new EventEmitter<Absence>();
  @ViewChild('singleGradeModal', {static: false}) singleGradeModal: SingleGradeOverlayComponent;
  @ViewChild('singleAbsenceModal', {static: false}) singleAbsenceModal: SingleAbsenceOverlayComponent;
  @ViewChild('confirmationModal', {static: false}) confirmationModal: ConfirmationModalComponent;

  isOnViewPupilDataPage: boolean = false;
  currentSemesterStartDate: Date;
  isExaminationSection: boolean = true;
  gradeType: string;


  constructor(private root: ElementRef) {
  }

  ngOnInit(): void {
    if (this.tableLayoutAsIdentifier === 'student_catalog') {
      this.isOnViewPupilDataPage = true;
    }
    if (['grades_sem_1', 'grades_sem_2'].includes(this.identifier)) {
      this.data.grades = this.data.grades.map((grade: Grade) => ({...grade, minutesSinceCreation: this.getMinutesDiff(grade.created)}));
      if (this.data.thesis && !this.data?.thesis?.hasOwnProperty('minutesSinceCreation')) {
        this.data.thesis['minutesSinceCreation'] = this.data?.thesis ? this.getMinutesDiff(this.data?.thesis?.created) : null;
      }
    }

    if (['abs_sem_1', 'abs_sem_2'].includes(this.identifier)) {
      this.data = this.data.map((absence: Absence) => ({...absence, minutesSinceCreation: this.getMinutesDiff(absence.created)}));
    }

    if (this.data.grades?.length) {
      this.shouldDisplayDifferencesSection = false;
    }

    if (this.identifier === 'grades_sem_1' || this.data.avg >= 5) {
      this.shouldDisplaySecondExaminationSection = false;
    }
  }

  displayDate(dateString: string): string {
    return moment(dateString, 'DD-MM-YYYY').format('DD.MM');
  }

  displayLongDate(dateString: string): string {
    return moment(dateString, 'DD-MM-YYYY').format('DD.MM.YYYY');
  }

  countFoundedAbsences(absencesList): any[] {
    return absencesList.filter(absence => absence.is_founded).length;
  }

  countUnfoundedAbsences(absencesList): any[] {
    return absencesList.filter(absence => !absence.is_founded).length;
  }

  gradeSubmitted(
    data: {
      selectedGrade: number,
      selectedDate: Date,
      id: number,
      isThesis?: boolean,
      isExaminationSection?: boolean,
      gradeType?: string,
      examinationType?: string,
      selectedGrade2?: number,
      semester?: number
    }): void {
    if (this.gradeType && this.gradeType === 'DIFFERENCE') {
      switch (this.identifier) {
        case 'grades_sem_1':
          data.semester = 1;
          break;
        case 'grades_sem_2':
          data.semester = 2;
          break;
      }
    }
    this.addGrade.emit(data);
    this.singleGradeModal.close();
  }

  absenceSubmitted(data: { date: Date, isFounded: boolean }): void {
    this.addAbsence.emit(data);
    this.singleAbsenceModal.close();
  }

  onGradeDelete(grade: Grade, shouldCheckType?: boolean) {
    let description: string;
    if (shouldCheckType) {
      this.gradeTypeDecider();
      switch (this.gradeType) {
        case 'SECOND_EXAMINATION':
          description = `Doriți să ștergeți notele de corigență ${grade.grade1} și ${grade.grade2} din data de ${this.displayLongDate(grade.taken_at)}?`;
          break;
        case 'DIFFERENCE':
          description = `Doriți să ștergeți notele de diferență ${grade.grade1} și ${grade.grade2} din data de ${this.displayLongDate(grade.taken_at)}?`;
          break;
      }
    } else {
      description = `Doriți să ștergeți nota ${grade.grade} din data de ${this.displayLongDate(grade.taken_at)}?`;
    }
    this.confirmationModal.open({
      title: 'Ștergeți nota?',
      description: description,
      confirmButtonCallback: () => {
        this.deleteGrade.emit(grade);
      }
    });
  }

  onAbsenceDelete(absence: Absence) {
    this.confirmationModal.open({
      title: 'Ștergeți absența?',
      description: `Doriți să ștergeți absența ${absence.is_founded ? 'motivată' : 'nemotivată'} din data de ${this.displayLongDate(absence.taken_at)}?`,
      confirmButtonCallback: () => {
        this.deleteAbsence.emit(absence);
      }
    });
  }

  onAbsenceAuthorize(absence: Absence) {
    this.confirmationModal.open({
      title: 'Motivați absența?',
      description: `Doriți să motivați absența din data de ${this.displayLongDate(absence.taken_at)}?`,
      confirmButtonCallback: () => {
        this.authorizeAbsence.emit(absence);
      }
    });
  }

  openGradeOverlay(event: Event, isThesis: boolean, grade?: any, isExaminationSection?: boolean, isEditing?: boolean): void {
    if (isExaminationSection) {
      this.isExaminationSection = isExaminationSection;
      this.gradeTypeDecider();
    } else {
      this.isExaminationSection = false;
    }
    this.currentSemesterStartDate = getCurrentSemesterStartDate(this.academicYearCalendar);
    this.singleGradeModal.open(event.target, this.root.nativeElement, grade, isThesis, isEditing);
  }

  gradeTypeDecider() {
    if (this.shouldDisplaySecondExaminationSection) {
      this.gradeType = 'SECOND_EXAMINATION';
    } else {
      this.gradeType = 'DIFFERENCE';
    }
  }

  openAbsenceOverlay(event: Event, absence?: any): void {
    this.currentSemesterStartDate = getCurrentSemesterStartDate(this.academicYearCalendar);
    this.singleAbsenceModal.open(event.target, this.root.nativeElement, absence);
  }

  getMinutesDiff(datetimeString: string): number {
    // Convert server time (GMT+00:00) to local time
    const thenUtc = moment.utc(datetimeString, 'DD-MM-YYYYThh:mm:ss');
    const thenLocal = moment(thenUtc).local();
    const then = thenLocal.valueOf();

    // Milliseconds since Epoch;
    const now = moment().valueOf();

    return Math.round((now - then) / 1000 / 60);
  }
}
