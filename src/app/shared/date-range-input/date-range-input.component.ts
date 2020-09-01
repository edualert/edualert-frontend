import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DatepickerComponent} from '../datepicker/datepicker.component';
import {dateForInput} from '../utils';

@Component({
  selector: 'app-date-range-input',
  templateUrl: './date-range-input.component.html',
  styleUrls: ['./date-range-input.component.scss']
})
export class DateRangeInputComponent implements OnInit, AfterViewInit {

  @Input() labelValue: string;
  @Input() styleInput: string;
  @Input() messageErrorFrom: string;
  @Input() messageErrorTo: string;
  @Input() startDate: string;
  @Input() endDate: string;
  @Input() isSemesterDate: boolean;
  @Input() isCalendarEditable: boolean;

  @ViewChild('datepickerFrom', {'static': true}) datepickerFrom: DatepickerComponent;
  @ViewChild('datepickerTo', {'static': true}) datepickerTo: DatepickerComponent;

  @Output() dateChanged = new EventEmitter<{ date: Date, key: string }>();

  editableDates: boolean = true;
  dateFrom: Date;
  dateTo: Date;
  wrongDates = false;

  ngOnInit(): void {
    this.dateFrom = this.startDate ? new Date(this.startDate) : null;
    this.dateTo = this.endDate ? new Date(this.endDate) : null;
  }

  ngAfterViewInit(): void {
    this.editableDates = this.isCalendarEditable;
  }

  startDateChanged(date: Date) {
    // if (this.dateTo && (date > this.dateTo)) {
    //   this.messageErrorFrom = 'Zi de inceput invalidă';
    //   this.wrongDates = true;
    // } else if (date < new Date()) {
    //   this.messageErrorFrom = 'Ziua introdusă a trecut';
    //   this.wrongDates = true;
    // } else {
    //   this.messageErrorFrom = '';
    //   this.dateFrom = date;
    //   this.wrongDates = false;
    //   this.dateChanged.emit({date: date, key: 'starts_at'});
    // }

    // Uncomment after Demo

    this.messageErrorFrom = '';
    this.dateFrom = date;
    this.wrongDates = false;
    this.dateChanged.emit({date: date, key: 'starts_at'});
  }

  endDateChanged(date: Date) {
    // if (this.dateFrom && (date < this.dateFrom)) {
    //   this.messageErrorTo = 'Zi de inceput invalidă';
    //   this.wrongDates = true;
    // } else if (date < new Date()) {
    //   this.messageErrorTo = 'Ziua introdusă a trecut';
    //   this.wrongDates = true;
    // } else {
    //   this.messageErrorTo = '';
    //   this.dateTo = date;
    //   this.wrongDates = false;
    //   this.dateChanged.emit({date: date, key: 'ends_at'});
    // }

    // Uncomment after Demo

    this.messageErrorTo = '';
    this.dateTo = date;
    this.wrongDates = false;
    this.dateChanged.emit({date: date, key: 'ends_at'});
  }

  openPickerFrom() {
    this.datepickerFrom.open();
  }

  openPickerTo() {
    this.datepickerTo.open();
  }

  dateForInput(date) {
    return dateForInput(date);
  }

}
