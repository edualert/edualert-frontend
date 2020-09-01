import {OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AcademicYearCalendar} from '../../models/academic-year-calendar';
import {Semester} from '../../models/semester';
import {DateValidator} from './edit-study-year/date-validator';

export class ManageSchoolCalendarBaseClass implements OnInit {
  url = 'current-academic-year-calendar/';
  currentAcademicYear: AcademicYearCalendar;
  requestInProgress: boolean;
  isCalendarEditable: boolean;

  constructor(protected httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.requestInProgress = true;
    this.httpClient.get<AcademicYearCalendar>(this.url).subscribe(response => this.setCurrentAcademicYearFromFetch(response));
  }

  setCurrentAcademicYearFromFetch(response) {
    if (response) {
      this.currentAcademicYear = new AcademicYearCalendar(response);
    } else {
      this.initializeSchoolCalendarObject();
    }
    this.requestInProgress = false;
    // this.setCalendarAsEditable();
  }

  setCalendarAsEditable() {
    const yearStartDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear.first_semester.starts_at) || null;
    const today = new Date();
    if (yearStartDate && today.getTime() > yearStartDate.setDate(yearStartDate.getDate() + 15) || today.getTime() < yearStartDate.getTime()) {
      this.isCalendarEditable = false;
      return;
    }
    this.isCalendarEditable = true;
  }

  initializeSchoolCalendarObject() {
    this.currentAcademicYear = new AcademicYearCalendar({
      academic_year: null,
      first_semester: new Semester(),
      second_semester: new Semester(),
      events: []
    });
  }
}
