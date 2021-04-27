import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';

export class RawMatrixDay {
  dayNumber: number;
  month: 'previous' | 'current' | 'next';
  isDisabled: boolean;
}

export class InternalDate {
  year: number;
  month: number;
  day: number;
}

/**
 * The datepicker can be open/closed from its parent by accessing the component via ViewChild
 * and calling the open()/close() public methods.
 * Its internal dates are represented as objects with three properties: year, month, day.
 * It closes on Esc keypress or on outside click.
 *
 * Inputs:
 * - layout - in the future, we will have multiple layouts to choose from
 * - dateValue - the currently applied date value from the parent (can be any date format - ignored if invalid format)
 * - minDateValue - the min date that can be applied
 * - maxDateValue - the max date that can be applied
 * - withConfirmButtons - if true, the datepicker will emit the new date to its parent only when the apply button is clicked
 * - color - you can specify the theme color
 *
 * Outputs:
 * - dateChanged - emits to its parent the new date as an instance of Date
 */

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() readonly layout?: number = 1;
  @Input() readonly dateValue: Date | string;
  @Input() readonly minDateValue?: Date;
  @Input() readonly maxDateValue?: Date;
  @Input() readonly withConfirmButtons?: boolean;
  @Input() readonly color?: string;
  @Output() dateChanged = new EventEmitter<Date>();
  @Output() onDatePickerClose = new EventEmitter<boolean>();
  @ViewChild('rootElement') rootElement: ElementRef;
  disableActions = false;
  isOpen = false;
  selectedDate: InternalDate = {
    year: null,
    month: null,
    day: null
  };
  inView = {
    year: null,
    month: null
  };
  readonly today: InternalDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate()
  };

  readonly rows = 6;
  readonly columns = 7;
  readonly monthsLabels = [
    'Ianuarie',
    'Februarie',
    'Martie',
    'Aprilie',
    'Mai',
    'Iunie',
    'Iulie',
    'August',
    'Septembrie',
    'Octombrie',
    'Noiembrie',
    'Decembrie',
  ];
  rawDaysMatrix: RawMatrixDay[][];
  readonly minimumYear = 1000;
  readonly maximumYear = 3000;


  constructor() {
    this.escapeKeyClose = this.escapeKeyClose.bind(this);
    this.outsideClickClose = this.outsideClickClose.bind(this);
  }

  ngOnInit() {
    if (!this.dateValue) {
      this.setToday();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.minDateValue && changes.minDateValue.previousValue !== changes.minDateValue.currentValue) ||
      (changes.maxDateValue && changes.maxDateValue.previousValue !== changes.maxDateValue.currentValue)) {
      this.constructDays();
    }
  }

  ngAfterViewInit(): void {
    this.initialiseCssVariables();
  }

  private static getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  private static getDayOfWeek(date: Date) {
    return date.getDay();
  }

  private static nodeIsDescendant(ancestor: HTMLElement, event: any) { // Kind of sort of polyfill
    if (event.composedPath) {
      return (event.composedPath().includes(ancestor));
    }
    if (event.deepPath) {
      return (event.deepPath().includes(ancestor));
    }

    let node = event.target.parentNode;
    while (node !== null) {
      if (node === ancestor) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  private initialiseCssVariables() {
    const rootStyle = this.rootElement.nativeElement.style;
    rootStyle.setProperty('--primary-color', this.color || '#FFB732');
  }

  selectAllText(event: any) {
    event.target.select();
  }

  blurInputOnEnter(event: any) {
    const enterCode = 13;
    if (event.keyCode === enterCode || event.charCode === enterCode || event.code === 'Enter') {
      event.target.blur();
    }
  }

  private constructDays() {
    const previousMonthDays: number = DatepickerComponent.getDaysInMonth(this.inView.year, this.inView.month - 1);
    const currentMonthDays: number = DatepickerComponent.getDaysInMonth(this.inView.year, this.inView.month);
    const firstDayOfTheWeek = DatepickerComponent.getDayOfWeek(new Date(this.inView.year, this.inView.month)) || 7;

    const daysMatrix: RawMatrixDay[][] = [];
    for (let i = 0; i < this.rows; i++) {
      daysMatrix[i] = [];
      for (let j = 0; j < this.columns; j++) {
        if (i === 0 && j < firstDayOfTheWeek - 1) {
          daysMatrix[i][j] = {
            dayNumber: previousMonthDays - firstDayOfTheWeek + j + 2,
            month: 'previous',
            isDisabled: false
          };

          const year = this.inView.month === 0 ? this.inView.year - 1 : this.inView.year;
          const month = this.inView.month === 0 ? 11 : this.inView.month - 1;
          const date = new Date(year, month, daysMatrix[i][j].dayNumber);
          this.setIsDisabled(date, daysMatrix[i][j]);
        } else {
          const currentMonthDay = i * 7 + j - firstDayOfTheWeek + 2;
          if (currentMonthDay <= currentMonthDays) {
            daysMatrix[i][j] = {
              dayNumber: currentMonthDay,
              month: 'current',
              isDisabled: false
            };

            const date = new Date(this.inView.year, this.inView.month, daysMatrix[i][j].dayNumber);
            this.setIsDisabled(date, daysMatrix[i][j]);
          } else {
            daysMatrix[i][j] = {
              dayNumber: currentMonthDay - currentMonthDays,
              month: 'next',
              isDisabled: false
            };

            const year = this.inView.month === 11 ? this.inView.year + 1 : this.inView.year;
            const month = this.inView.month === 11 ? 0 : this.inView.month + 1;
            const date = new Date(year, month, daysMatrix[i][j].dayNumber);
            this.setIsDisabled(date, daysMatrix[i][j]);
          }
        }
      }
    }
    this.rawDaysMatrix = daysMatrix.slice();
  }

  setIsDisabled(date: Date, matrixDay: RawMatrixDay) {
    if ((this.minDateValue && date < this.minDateValue) || (this.maxDateValue && date > this.maxDateValue)) {
      matrixDay.isDisabled = true;
    }
  }

  setToday() {
    if (this.inView.year !== this.today.year || this.inView.month !== this.today.month) {
      this.inView.year = this.today.year;
      this.inView.month = this.today.month;
      this.constructDays();
    }
  }

  selectYear(year: number) {
    if (this.inView.year !== year) {
      this.inView.year = year;
      this.constructDays();
    }
  }

  selectMonth(index: number) {
    if (this.inView.month !== index) {
      this.inView.month = index;
      this.constructDays();
    }
  }

  selectPreviousMonth() {
    if (this.inView.month === 0) {
      this.inView.year--;
      this.inView.month = 11;
    } else {
      this.inView.month--;
    }
    this.constructDays();
  }

  selectNextMonth() {
    if (this.inView.month === 11) {
      this.inView.year++;
      this.inView.month = 0;
    } else {
      this.inView.month++;
    }
    this.constructDays();
  }

  selectDayFromCell(dayCell: RawMatrixDay) {
    if (dayCell.isDisabled) {
      return;
    }

    if (dayCell.month === 'previous') {
      this.selectPreviousMonth();
    } else if (dayCell.month === 'next') {
      this.selectNextMonth();
    } else {
      if (!this.withConfirmButtons) {
        this.selectDate(this.inView.year, this.inView.month, dayCell.dayNumber, true);
        window.setTimeout(() => {
          this.close();
        }, 200);
      } else {
        this.selectDate(this.inView.year, this.inView.month, dayCell.dayNumber, false);
      }
    }
  }

  private selectDate(year: number, month: number, day: number, submitSelection?: boolean) {
    this.selectedDate = {
      year: year,
      month: month,
      day: day
    };

    if (submitSelection) {
      this.dateChanged.emit(new Date(year, month, day));
    }
  }

  applyYearInput(event: any) {
    const intValue = parseInt(event.target.value, 10);
    const floatValue = parseFloat(event.target.value);
    const initialYear = this.inView.year;
    if (intValue === floatValue && intValue >= this.minimumYear && intValue <= this.maximumYear) {
      this.selectYear(intValue);
    } else {
      this.inView.year = 0;
      window.requestAnimationFrame(() => {
        this.inView.year = initialYear;
      });
    }
  }

  applyClicked() {
    const year = this.selectedDate.year;
    const month = this.selectedDate.month;
    const day = this.selectedDate.day;
    if (year && month && day) {
      this.dateChanged.emit(new Date(year, month, day));
      window.setTimeout(() => {
        this.close();
      }, 200);
    }
  }

  public close() {
    window.removeEventListener('keydown', this.escapeKeyClose);
    window.removeEventListener('click', this.outsideClickClose);
    this.isOpen = false;
    this.onDatePickerClose.emit(this.isOpen);
  }

  public open() {
    if (this.isOpen) {
      this.disableActions = false;
      return;
    }

    this.setInternalDatesAtOpen();
    this.initialiseCssVariables();
    this.isOpen = true;

    window.requestAnimationFrame(() => {
      window.addEventListener('keydown', this.escapeKeyClose);
      window.addEventListener('click', this.outsideClickClose);
      this.bringDatepickerInsideScreenBoundaries();
    });
  }

  private bringDatepickerInsideScreenBoundaries() {
    const elem = this.rootElement.nativeElement;
    const rect = elem.getBoundingClientRect();
    if (rect.x < 30) {
      elem.style.transform = `translate(${-rect.x + 30}px)`;
    }
  }

  private setInternalDatesAtOpen() {
    if (!this.dateValue) {
      this.selectDate(null, null, null);
      this.setToday();
    } else {
      this.setDateFromParent(this.dateValue);
    }
  }

  private setDateFromParent(rawDate: Date | string | any) {
    const date = new Date(rawDate);
    if (date instanceof Date && !isNaN(date as any)) {
      this.selectYear(date.getFullYear());
      this.selectMonth(date.getMonth());
      this.selectDate(date.getFullYear(), date.getMonth(), date.getDate());
    }
  }

  private escapeKeyClose(event) {
    const escCode = 27;
    if (event.keyCode === escCode || event.key === 'Escape') {
      this.close();
    }
  }

  private outsideClickClose(event) {
    if (!DatepickerComponent.nodeIsDescendant(this.rootElement.nativeElement, event)) {
      if (this.isOpen) {
        this.close();
      }
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.escapeKeyClose);
    window.removeEventListener('click', this.outsideClickClose);
  }
}
