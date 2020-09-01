import {Component, OnInit, HostListener} from '@angular/core';
import {eventTypesNames, eventTypesNamesFirstSemester, eventTypesNamesSecondSemester, Event, EventError} from '../../../models/event';
import {ManageSchoolCalendarBaseClass} from '../manage-school-calendar';
import {SemesterError} from '../../../models/semester';
import {convertDateToString, convertStringToDate} from '../../../shared/calendar/calendar-utils';
import {DateValidator} from './date-validator';

@Component({
  selector: 'app-edit-study-year',
  templateUrl: './edit-study-year.component.html',
  styleUrls: ['./edit-study-year.component.scss', '../../../shared/label-styles.scss'],
})

export class EditStudyYearComponent extends ManageSchoolCalendarBaseClass implements OnInit {
  currentAcademicYearErrorMessages: {
    first_semester: SemesterError,
    second_semester: SemesterError,
    events: EventError[]
  };

  eventTypesFirstSemester = eventTypesNamesFirstSemester;
  eventTypesSecondSemester = eventTypesNamesSecondSemester;
  eventTypesOtherEvents = eventTypesNames;

  hasUnfilledFields: boolean;
  hasModifiedData = false;
  hasUnsavedData = true;

  convertDateToString = convertDateToString;
  convertStringToDate = convertStringToDate;


  ngOnInit(): void {
    this.initializeSchoolCalendarErrorObject();
    super.ngOnInit();
  }

  updateAcademicYearCalendar(): void {
    delete this.currentAcademicYear.academic_year;
    this.httpClient.put(this.url, this.currentAcademicYear).subscribe();
  }

  @HostListener('window:beforeunload')
  refreshGuard($event): void {
    if (this.hasModifiedData) {
      $event.returnValue = '\0';
    }
  }

  findEvent(event_type: any, eventTypeList: string): number {
    return this[eventTypeList].findIndex(x => x.key === event_type);
  }

  initializeSchoolCalendarErrorObject() {
    this.currentAcademicYearErrorMessages = {
      first_semester: new SemesterError(),
      second_semester: new SemesterError(),
      events: []
    };
  }

  setCurrentAcademicYearFromFetch(response) {
    super.setCurrentAcademicYearFromFetch(response);
    if (response) {
      this.currentAcademicYearErrorMessages.first_semester.events = new Array(response.first_semester.events.length)
        .fill(null)
        .map(() => (new EventError()));
      this.currentAcademicYearErrorMessages.second_semester.events = new Array(response.second_semester.events.length)
        .fill(null)
        .map(() => (new EventError()));
      this.currentAcademicYearErrorMessages.events = new Array(response.events.length)
        .fill(null)
        .map(() => (new EventError()));
    }
  }

  selectEventFirstSemester(event: { element, index }, eventID: number): void {
    this.hasModifiedData = true;
    this.currentAcademicYear.first_semester.events[eventID].event_type = event.element ? event.element.key : null;
    this.currentAcademicYearErrorMessages.first_semester.events[eventID].event_type = null;
  }

  selectEventSecondSemester(event: { element, index }, eventID: number): void {
    this.hasModifiedData = true;
    this.currentAcademicYear.second_semester.events[eventID].event_type = event.element ? event.element.key : null;
    this.currentAcademicYearErrorMessages.second_semester.events[eventID].event_type = null;
  }

  selectEventOtherEvent(event: { element, index }, eventID: number): void {
    this.hasModifiedData = true;
    this.currentAcademicYear.events[eventID].event_type = event.element ? event.element.key : null;
    this.currentAcademicYearErrorMessages.events[eventID].event_type = null;
  }

  addNewEventFirstSemester(): void {
    this.hasModifiedData = true;
    this.currentAcademicYear.first_semester.events.push(new Event());
    delete this.currentAcademicYear.first_semester.events[this.currentAcademicYear.first_semester.events.length - 1].id;
    this.currentAcademicYearErrorMessages.first_semester.events.push(new EventError());
  }

  addNewEventSecondSemester(): void {
    this.hasModifiedData = true;
    this.currentAcademicYear.second_semester.events.push(new Event());
    delete this.currentAcademicYear.second_semester.events[this.currentAcademicYear.second_semester.events.length - 1].id;
    this.currentAcademicYearErrorMessages.second_semester.events.push(new EventError());
  }

  addNewEventOtherEvents(): void {
    this.hasModifiedData = true;
    this.currentAcademicYear.events.push(new Event());
    delete this.currentAcademicYear.events[this.currentAcademicYear.events.length - 1].id;
    this.currentAcademicYearErrorMessages.events.push(new EventError());
  }

  handleEventDateChange($event: { date: Date, key: string }, index: number, list: Event[], semester?: string): void {
    this.hasModifiedData = true;
    list[index][$event.key] = convertDateToString($event.date);
    if (semester) {
      let semesterKey: string;
      if (semester === 'first_semester') {
        semesterKey = 'first_semester';
      }
      if (semester === 'second_semester') {
        semesterKey = 'second_semester';
      }
      const startDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear[semesterKey]['starts_at']);
      const endDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear[semesterKey]['ends_at']);
      if (!DateValidator.checkDateIsInRange($event.date, startDate, endDate)) {
        this.currentAcademicYearErrorMessages[semesterKey].events[index][$event.key] = 'Data introdusă trebuie să se încadreze în intervalul semestrului';
      }
    } else {
      const endDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['second_semester']['ends_at']);
      if (!DateValidator.isDateAfter($event.date, endDate)) {
        this.currentAcademicYearErrorMessages.events[index][$event.key] = 'Data introdusă trebuie să fie după finalul celui de al doilea semestru';
      }
    }
  }

  handleSemesterDateChange($event: { date: Date, key: string }, semester, element): void {
    this.hasModifiedData = true;
    this.currentAcademicYear[semester][element] = convertDateToString($event.date);
    this.currentAcademicYearErrorMessages[semester][element] = '';
    switch (semester) {
      case 'first_semester':
        if (this.currentAcademicYear['second_semester']['starts_at']) {
          const formattedDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['second_semester']['starts_at']);
          const hasError = DateValidator.isValidFirstSemesterEnd(new Date(this.currentAcademicYear[semester][element]), null,
            formattedDate);
          if (hasError) {
            this.currentAcademicYearErrorMessages[semester][element] = hasError;
            this.currentAcademicYear[semester][element] = '';
          }
        }
        break;
      case 'second_semester':
        if (this.currentAcademicYear['first_semester']['ends_at'] && element[0] === 'starts_at') {
          const formattedDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['first_semester']['ends_at']);
          const hasError = DateValidator.isValidFirstSemesterEnd(new Date(this.currentAcademicYear[semester][element]),
            formattedDate, null);
          this.currentAcademicYearErrorMessages[semester][element] = hasError ? hasError : '';
        }
    }
  }

  cancelEdit() {
    this.refreshGuard(null);
  }

  deleteEvent(eventList, errorEventList, i: number): void {
    this.hasModifiedData = true;
    eventList.splice(i, 1);
    errorEventList.splice(i, 1);
  }

  submit(): void {
    this.hasUnfilledFields = false;
    // this.checkObject(this.currentAcademicYear, this.currentAcademicYearErrorMessages);
    if (!this.hasUnfilledFields) {
      this.hasUnsavedData = false;
      this.updateAcademicYearCalendar();
    }
  }

  checkObject(dict, requiredFields): void {
    Object.keys(requiredFields)
      .forEach(key => {
        const data = dict[key];
        if (requiredFields.hasOwnProperty(key) && data) {
          if (typeof data === 'object') {
            if (Array.isArray(data) && key === 'events') {
              this.checkArray(data, requiredFields[key]);
            } else {
              this.checkObject(data, requiredFields[key]);
            }
          }
        } else {
          requiredFields[key] = 'Acest câmp este obligatoriu';
          this.hasUnfilledFields = true;
        }
      });
  }

  checkArray(array, requiredFields) {
    array.forEach((event, index) => {
      const referenceStartDate = DateValidator.formatDateMMDDYYYY(event['starts_at']);
      const referenceEndDate = DateValidator.formatDateMMDDYYYY(event['ends_at']);
      requiredFields[index]['starts_at'] = DateValidator.isDateUnique(referenceStartDate, referenceEndDate, array, index) ? null : 'Evenimentele nu se pot suprapune';
      requiredFields[index]['ends_at'] = requiredFields[index]['starts_at'];
      if (requiredFields[index]['ends_at'] || requiredFields[index]['starts_at']) {
        this.hasUnfilledFields = true;
      }
    });
  }

}
