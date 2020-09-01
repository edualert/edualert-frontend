import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import * as moment from 'moment';
import OpenCloseable from '../../shared/open-closeable';
import {DatepickerComponent} from '../../shared/datepicker/datepicker.component';

@Component({
  selector: 'app-single-grade-overlay',
  templateUrl: './single-grade-overlay.component.html',
  styleUrls: ['./single-grade-overlay.component.scss', '../grade-absence-overlay.scss']
})
export class SingleGradeOverlayComponent extends OpenCloseable {
  @Output() save: EventEmitter<{ selectedGrade: number, selectedDate: Date, id: number }> = new EventEmitter<{ selectedGrade: number, selectedDate: Date, id: number }>();
  readonly grades = new Array(10).fill(null).map((val, i) => i + 1);
  selectedGrade: number;
  selectedDate: Date;
  existingId: number;
  @ViewChild('datepicker', {static: false}) datepicker: DatepickerComponent;

  constructor(private elRef: ElementRef) {
    super();
  }

  selectGrade(grade: { element: number, index: number }): void {
    this.selectedGrade = grade.element;
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  open(target?: EventTarget, containerElement?: HTMLElement, existingGrade?: any) {
    super.open();
    this.resetData(existingGrade);
    this.setPosition((target as HTMLElement), containerElement);
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

  private resetData(existingGrade?: {grade: number, taken_at: number, id: number}) {

    // Set existing grade or reset data to default;
    if (existingGrade) {
      this.existingId = existingGrade.id;
      this.selectedGrade = existingGrade.grade;
      this.selectedDate = moment(existingGrade.taken_at, 'DD-MM-YYYY').toDate();
    } else {
      this.existingId = null;
      this.selectedGrade = null;
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

  saveClick(): void {
    this.save.emit({selectedGrade: this.selectedGrade, selectedDate: this.selectedDate, id: this.existingId});
  }
}
