import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import * as moment from 'moment';
import OpenCloseable from '../../shared/open-closeable';
import {DatepickerComponent} from '../../shared/datepicker/datepicker.component';

@Component({
  selector: 'app-single-absence-overlay',
  templateUrl: './single-absence-overlay.component.html',
  styleUrls: ['./single-absence-overlay.component.scss', '../grade-absence-overlay.scss']
})
export class SingleAbsenceOverlayComponent extends OpenCloseable {
  @Output() save: EventEmitter<{isFounded: boolean, date: Date}> = new EventEmitter<{isFounded: boolean, date: Date}>();
  isFounded: boolean = false;
  selectedDate: any;
  existingId: number;
  today: Date;
  @ViewChild('datepicker', {static: false}) datepicker: DatepickerComponent;

  constructor(private elRef: ElementRef) {
    super();
    this.today = new Date();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  toggleFounded(): void {
    this.isFounded = !this.isFounded;
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
      element.style.transform = `translateX(${-rect.left + 30}px)`;
    }
  }

  private resetData(existingGrade?: {is_founded: boolean, taken_at: number, id: number}) {

    // Set existing grade or reset data to default;
    if (existingGrade) {
      this.selectedDate = moment(existingGrade.taken_at, 'DD-MM-YYYY').toDate();
      this.isFounded = existingGrade.is_founded;
      this.existingId = existingGrade.id;
    } else {
      this.selectedDate = new Date();
      this.existingId = null;
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
    this.save.emit({isFounded: this.isFounded, date: this.selectedDate});
  }
}
