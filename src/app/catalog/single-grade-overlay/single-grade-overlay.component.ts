import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';
import OpenCloseable from '../../shared/open-closeable';
import { DatepickerComponent } from '../../shared/datepicker/datepicker.component';
import { IdText } from '../../models/id-text';
import { InputValidator } from '../../services/field-validation';

@Component({
  selector: 'app-single-grade-overlay',
  templateUrl: './single-grade-overlay.component.html',
  styleUrls: ['./single-grade-overlay.component.scss', '../grade-absence-overlay.scss']
})
export class SingleGradeOverlayComponent extends OpenCloseable {
  @Input() datePickerMinDateValue: Date;
  @Input() tableLayoutAsIdentifier: string;
  @Input() isExaminationSection?: boolean;
  @Input() gradeType?: string;

  @Output() save: EventEmitter<{
    selectedGrade: number,
    selectedDate: Date,
    id: number,
    isThesis?: boolean,
    isExaminationSection?: boolean,
    gradeType?: string,
    examinationType?: any,
    selectedGrade2?: number,
    semester?: number
  }> = new EventEmitter<{
    selectedGrade: number,
    selectedDate: Date,
    id: number,
    isThesis?: boolean,
    isExaminationSection?: boolean,
    gradeType?: string,
    examinationType?: string,
    selectedGrade2?: number,
    semester?: number
  }>();

  readonly grades = new Array(10).fill(null).map((val, i) => i + 1);
  readonly examinationTypes: IdText[] = [{id: 'ORAL', text: 'Oral'}, {id: 'WRITTEN', text: 'Scris'}];
  selectedGrade: number;
  selectedGrade2: number;
  selectedExaminationType: IdText;
  fieldErrors = {
    selectedGrade: '',
    selectedGrade2: '',
    selectedExaminationType: ''
  };
  isEditing: boolean = false;
  selectedDate: Date;
  existingId: number;
  isThesis: boolean;
  today: Date;
  @ViewChild('datepicker', {static: false}) datepicker: DatepickerComponent;

  constructor(private elRef: ElementRef) {
    super();
    this.today = new Date();
  }

  selectGrade(grade: { element: number, index: number }, isSecondGrade?: boolean): void {
    if (isSecondGrade) {
      this.selectedGrade2 = grade.element;
    } else {
      this.selectedGrade = grade.element;
    }
  }

  selectExaminationType(examinationType: IdText): void {
    this.fieldErrors.selectedExaminationType = '';
    this.selectedExaminationType = examinationType;
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  open(target?: EventTarget, containerElement?: HTMLElement, existingGrade?: any, isThesis?: boolean, isEditing?: boolean) {
    this.isEditing = isEditing;
    super.open();
    setTimeout(() => {
      if (!existingGrade) {
        const datePickerContainer = document.querySelectorAll(`div.date-container > div.datepicker-container`)[0];
        datePickerContainer.classList.add('centered-datepicker');
      }
    }, 200);
    this.resetData(existingGrade);
    this.setPosition((target as HTMLElement), containerElement);
    this.isThesis = isThesis ? isThesis : null;
  }

  private setPosition(target: HTMLElement, containerElement: HTMLElement) {
    const containerRect = containerElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    window.requestAnimationFrame(() => {
      this.elRef.nativeElement.style.top = `${targetRect.y - containerRect.y - 5}px`;
      this.elRef.nativeElement.style.right = `calc(100% - ${targetRect.x - containerRect.x + targetRect.width + 5}px)`;
      this.elRef.nativeElement.style.transform = 'none';

      this.bringInsideScreenBoundaries(this.elRef.nativeElement);
    });
  }

  private bringInsideScreenBoundaries(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    if (rect.left < 0) {
      element.style.transform = `translateX(${-rect.left + 25}px)`;
    }
  }

  private resetData(existingGrade?: { grade: number, taken_at: number, id: number, grade1?: number, grade2?: number, examination_type?: string }) {
    // Set existing grade or reset data to default;
    if (existingGrade) {
      this.existingId = existingGrade.id;
      if (this.isExaminationSection) {
        this.selectedGrade = existingGrade.grade1;
        this.selectedGrade2 = existingGrade.grade2;
        this.selectedExaminationType =  this.examinationTypes[this.examinationTypes.findIndex(element => element.id === existingGrade.examination_type)];
      } else {
        this.selectedGrade = existingGrade.grade;
      }
      if (this.tableLayoutAsIdentifier === 'class_master') {
        // Automatically move the behavior grade's date to today for edit
        this.selectedDate = new Date();
      } else {
        this.selectedDate = moment(existingGrade.taken_at, 'DD-MM-YYYY').toDate();
      }
    } else {
      this.existingId = null;
      this.selectedGrade = null;
      if (this.isExaminationSection) {
        this.selectedGrade2 = null;
        this.selectedExaminationType = null;
      }
      this.selectedDate = new Date();
    }
  }

  displayDate(date: Date): string {
    if (date) {
      return moment(date).format('DD.MM');
    }
    return '';
  }

  openDatepicker(): void {
    this.datepicker.open();
  }

  checkErrors(): boolean {
    let hasErrors = false;
    this.fieldErrors.selectedGrade = InputValidator.isRequiredError(this.selectedGrade);
    if (this.isExaminationSection) {
      this.fieldErrors.selectedGrade2 = InputValidator.isRequiredError(this.selectedGrade2);
      this.fieldErrors.selectedExaminationType = InputValidator.isRequiredError(this.selectedExaminationType);
    }
    if (!Object.values(this.fieldErrors).every((value) => ['', null].includes(value))) {
      hasErrors = true;
    }
    return hasErrors;
  }

  saveClick(): void {
    const hasErrors = this.checkErrors();
    if (this.selectedGrade && !hasErrors) {
      if (this.isExaminationSection) {
        this.save.emit({
          selectedGrade: this.selectedGrade,
          selectedDate: this.selectedDate,
          id: this.existingId,
          isThesis: this.isThesis ? this.isThesis : null,
          isExaminationSection: this.isExaminationSection,
          selectedGrade2: this.selectedGrade2,
          examinationType: this.selectedExaminationType.id,
          gradeType: this.gradeType
        });
      } else {
        this.save.emit({selectedGrade: this.selectedGrade, selectedDate: this.selectedDate, id: this.existingId, isThesis: this.isThesis ? this.isThesis : null});
      }
    }
  }
}
