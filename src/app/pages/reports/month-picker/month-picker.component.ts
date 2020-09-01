import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {monthsRo} from '../../../shared/utils';
import {AcademicYearCalendarService} from '../../../services/academic-year-calendar.service';
import {AcademicYearCalendar} from '../../../models/academic-year-calendar';
import {convertStringToDate} from '../../../shared/calendar/calendar-utils';

@Component({
  selector: 'app-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.scss']
})
export class MonthPickerComponent implements OnInit {
  @Output() dateChanged = new EventEmitter<Date>();

  academicYearStartDate: Date = null;
  academicYearEndDate: Date = null;

  disableForthArrow: boolean = false;
  disableBackArrow: boolean = false;

  currentMonth: {
    timestamp: Date | null,
    display: string,
  } = {
    timestamp: null,
    display: '',
  };

  constructor(academicCalendarService: AcademicYearCalendarService) {
    academicCalendarService.getData(false).subscribe(response => {
      const academicCalendar = new AcademicYearCalendar(response);
      const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
      const startDate = convertStringToDate(academicCalendar.first_semester.starts_at);
      const endDate = convertStringToDate(`01-09-${academicCalendar.academic_year + 1}`);
      this.academicYearStartDate = typeof startDate === 'object' ? startDate : new Date();
      this.academicYearEndDate = typeof endDate === 'object' ? endDate : new Date();
      const date = new Date();
      if (date > this.academicYearEndDate) {
        this.currentMonth = {
          timestamp: this.academicYearEndDate,
          display: monthsRo[this.academicYearEndDate.getMonth()] + ' ' + this.academicYearEndDate.getFullYear()
        };
        this.disableForthArrow = true;
      } else if (date < this.academicYearStartDate) {
        this.currentMonth = {
          timestamp: this.academicYearStartDate,
          display: monthsRo[this.academicYearStartDate.getMonth()] + ' ' + this.academicYearStartDate.getFullYear()
        };
        this.disableBackArrow = true;
      } else {
        this.currentMonth = {
          timestamp: date,
          display: monthsRo[date.getMonth()] + ' ' + date.getFullYear()
        };
        this.disableForthArrow = true;
      }
      this.dateChanged.emit(this.currentMonth.timestamp);
    });
  }

  changeMonth(type: string): void {
    let date = this.currentMonth.timestamp;
    if (type === 'back') {
      let current;
      if (date.getMonth() == 0) {
        current = new Date(date.getFullYear() - 1, 11, 1);
      } else {
        current = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      }
      if (this.academicYearStartDate > current) {
        this.disableBackArrow = true;
        current = this.academicYearStartDate;
      }
      this.currentMonth = {
        timestamp: current,
        display: monthsRo[current.getMonth()] + ' ' + current.getFullYear()
      };
      this.disableForthArrow = false;
      this.dateChanged.emit(current);
    }
    if (type === 'forth') {
      let current;
      if (date.getMonth() == 11) {
        current = new Date(date.getFullYear() + 1, 0, 1);
      } else if ( date.getMonth() === new Date().getMonth() ) {
        current = new Date(date.getFullYear(), date.getMonth(), 1);
      } else {
        current = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      }
      if ((this.academicYearEndDate.getMonth() <= current.getMonth() && this.academicYearEndDate.getFullYear() === current.getFullYear())) {
        this.disableForthArrow = true;
        current = this.academicYearEndDate;
      } else if ( current.getMonth() === new Date().getMonth() ) {
        this.disableForthArrow = true;
      }
      this.currentMonth = {
        timestamp: current,
        display: monthsRo[current.getMonth()] + ' ' + current.getFullYear()
      };
      this.disableBackArrow = false;
      this.dateChanged.emit(current);
    }
  }

  ngOnInit(): void {
  }

}
