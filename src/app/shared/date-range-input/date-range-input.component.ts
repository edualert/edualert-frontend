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
  @Input() isCalendarEditable: boolean;

  @ViewChild('datepickerFrom', {'static': true}) datepickerFrom: DatepickerComponent;
  @ViewChild('datepickerTo', {'static': true}) datepickerTo: DatepickerComponent;

  @Output() dateChanged = new EventEmitter<{ date: Date, key: string, errorMessage?: string, shouldNotHandle?: boolean }>();

  editableDates: boolean = true;
  dateFrom: Date;
  dateTo: Date;
  yesterday: Date;
  wrongDates = false;
  startDateErrorMessage: string = null;
  endDateErrorMessage: string = null;

  ngOnInit(): void {
    this.dateFrom = this.startDate ? new Date(this.startDate) : null;
    this.dateTo = this.endDate ? new Date(this.endDate) : null;
    this.setYesterday();
  }

  ngAfterViewInit(): void {
    this.editableDates = this.isCalendarEditable;
  }

  startDateChanged(date: Date) {
    if (this.dateTo && (date > this.dateTo)) {
      this.startDateErrorMessage = 'Zi de început invalidă';
      this.wrongDates = true;
    } else {
      this.startDateErrorMessage = null;
      this.wrongDates = false;
    }
    this.dateFrom = date;
    this.dateChanged.emit({date: date, key: 'starts_at', errorMessage: this.startDateErrorMessage});

    if (this.dateFrom && !(this.dateTo < this.dateFrom) && this.endDateErrorMessage === 'Zi de final invalidă') {
      this.dateChanged.emit({date: date, key: 'ends_at', errorMessage: '', shouldNotHandle: true});
    }
  }

  endDateChanged(date: Date) {
    if (this.dateFrom && (date < this.dateFrom)) {
      this.endDateErrorMessage = 'Zi de final invalidă';
      this.wrongDates = true;
    } else {
      this.endDateErrorMessage = null;
      this.wrongDates = false;
    }
    this.dateTo = date;
    this.dateChanged.emit({date: date, key: 'ends_at', errorMessage: this.endDateErrorMessage});

    if (this.dateTo && !(this.dateFrom > this.dateTo) && this.startDateErrorMessage === 'Zi de început invalidă') {
      this.dateChanged.emit({date: date, key: 'starts_at', errorMessage: '', shouldNotHandle: true});
    }
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

  private setYesterday() {
    this.yesterday = new Date();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
  }

}
