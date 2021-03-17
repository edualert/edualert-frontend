import { Component, HostListener, OnInit } from '@angular/core';
import { eventTypesNames, eventTypesNamesFirstSemester, eventTypesNamesSecondSemester, Event, EventError } from '../../../models/event';
import { ManageSchoolCalendarBaseClass } from '../manage-school-calendar';
import { SemesterError } from '../../../models/semester';
import { convertDateToString, convertStringToDate, getMaxDateString, getStudyYearEndDate } from '../../../shared/calendar/calendar-utils';
import { DateValidator } from './date-validator';
import { InputValidator } from '../../../services/field-validation';

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
  secondSemesterEndEvents: string[] = [
    'SECOND_SEMESTER_END_VIII_GRADE',
    'SECOND_SEMESTER_END_XII_XIII_GRADE',
    'SECOND_SEMESTER_END_IX_XI_FILIERA_TEHNOLOGICA'
  ];

  hasUnfilledFields: boolean;
  hasModifiedData = false;
  hasUnsavedData = true;
  hasErrors = false;

  convertDateToString = convertDateToString;
  convertStringToDate = convertStringToDate;

  eventsOverlappingErrorMessage: string = 'Evenimentele nu se pot suprapune';
  datesEqualityErrorMessage: string = 'Datele de început și final trebuie să fie egale';


  ngOnInit(): void {
    this.initializeSchoolCalendarErrorObject();
    super.ngOnInit();
  }

  updateAcademicYearCalendar(): void {
    delete this.currentAcademicYear.academic_year;
    this.httpClient.put(this.url, this.currentAcademicYear).subscribe(() => this.router.navigateByUrl('/manage-school-calendar'));
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

  handleEventDateChange($event: { date: Date, key: string, errorMessage: string, shouldNotHandle?: boolean }, index: number, list: Event[], semester?: string): void {
    this.hasModifiedData = true;
    if ($event.shouldNotHandle) {
      if (semester) {
        this.currentAcademicYearErrorMessages[semester].events[index][$event.key] = $event.errorMessage;
      } else {
        this.currentAcademicYearErrorMessages.events[index][$event.key] = $event.errorMessage;
      }
      return;
    }
    list[index][$event.key] = convertDateToString($event.date);
    if ($event.errorMessage) { // If we have error message emitted on this.dateChanged from date-range-input don't do the other checks
      if (semester) {
        this.currentAcademicYearErrorMessages[semester].events[index][$event.key] = $event.errorMessage;
      } else {
        this.currentAcademicYearErrorMessages.events[index][$event.key] = $event.errorMessage;
      }
      return;
    }
    if (semester) {
      this.currentAcademicYearErrorMessages[semester].events[index][$event.key] = '';

      const eventType = list[index].event_type.toString();

      if (this.secondSemesterEndEvents.includes(eventType)) {
        const semesterEventStartDate = this.currentAcademicYear.second_semester.events[index].starts_at;
        const semesterEventEndDate = this.currentAcademicYear.second_semester.events[index].ends_at;
        if (semesterEventStartDate !== semesterEventEndDate) {
          this.currentAcademicYearErrorMessages[semester].events[index]['starts_at'] = this.datesEqualityErrorMessage;
          this.currentAcademicYearErrorMessages[semester].events[index]['ends_at'] = this.datesEqualityErrorMessage;
        } else if (this.currentAcademicYearErrorMessages[semester].events[index]['starts_at'] === this.datesEqualityErrorMessage) {
          this.currentAcademicYearErrorMessages[semester].events[index]['starts_at'] = '';
        } else if (this.currentAcademicYearErrorMessages[semester].events[index]['ends_at'] === this.datesEqualityErrorMessage) {
          this.currentAcademicYearErrorMessages[semester].events[index]['ends_at'] = '';
        }
      }
      if (eventType === 'SECOND_SEMESTER_END_IX_XI_FILIERA_TEHNOLOGICA') {
        const secondSemesterStartDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['second_semester']['starts_at']);
        const studyYearEndDate = getStudyYearEndDate(DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['first_semester']['starts_at']));
        if (DateValidator.isDateAfter($event.date, studyYearEndDate)) {
          this.currentAcademicYearErrorMessages[semester].events[index][$event.key] = 'Data introdusă trebuie să fie înainte de finalul anului școlar';
        }
        if (!DateValidator.isDateAfter($event.date, secondSemesterStartDate)) {
          this.currentAcademicYearErrorMessages[semester].events[index][$event.key] = 'Data introdusă trebuie să fie după începutul celui de al doilea semestru';
        }
        this.checkSecondSemesterPublicHolidaysDates(this.currentAcademicYear.second_semester.events);

        if (list[index].starts_at === list[index].ends_at) {
          const referenceStartDate = DateValidator.formatDateMMDDYYYY(list[index].starts_at)
          const referenceEndDate = DateValidator.formatDateMMDDYYYY(list[index].ends_at)
          this.currentAcademicYearErrorMessages[semester].events[index]['starts_at'] = DateValidator.isDateUnique(referenceStartDate, referenceEndDate, this.currentAcademicYear.events) ? null : `Acest eveniment nu se poate suprapune cu sectiunea 'Alte evenimente'`;
          if (this.currentAcademicYearErrorMessages[semester].events[index]['starts_at']) {
            this.currentAcademicYearErrorMessages[semester].events[index]['ends_at'] = this.currentAcademicYearErrorMessages[semester].events[index]['starts_at'];
          }
        }

      } else {
        let startDate;
        let endDate;
        startDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear[semester]['starts_at']);
        if (semester === 'first_semester' || ['SECOND_SEMESTER_END_VIII_GRADE', 'SECOND_SEMESTER_END_XII_XIII_GRADE'].includes(eventType)) {
          endDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear[semester]['ends_at']);
        } else {
          endDate = DateValidator.formatDateMMDDYYYY(getMaxDateString(this.getSecondSemesterEndEventsDates(this.currentAcademicYear)));
        }
        if (!DateValidator.checkDateIsInRange($event.date, startDate, endDate)) {
          this.currentAcademicYearErrorMessages[semester].events[index][$event.key] = 'Data introdusă trebuie să se încadreze în intervalul semestrului';
        }
      }
    } else {
      this.currentAcademicYearErrorMessages.events[index][$event.key] = '';
      const secondSemesterEndDate = DateValidator.formatDateMMDDYYYY(getMaxDateString(this.getSecondSemesterEndEventsDates(this.currentAcademicYear)));
      const studyYearEndDate = getStudyYearEndDate(DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['first_semester']['starts_at']));
      if (!DateValidator.isDateAfter($event.date, secondSemesterEndDate)) {
        this.currentAcademicYearErrorMessages.events[index][$event.key] = 'Data introdusă trebuie să fie după finalul celui de al doilea semestru';
      }
      if (DateValidator.isDateAfter($event.date, studyYearEndDate)) {
        this.currentAcademicYearErrorMessages.events[index][$event.key] = 'Data introdusă trebuie să fie înainte de finalul anului școlar';
      }
    }
  }

  getSecondSemesterEndEventsDates(currentAcademicYearCalendar): string[] {
    const endDateStringsArray: string[] = [];
    endDateStringsArray.push(currentAcademicYearCalendar.second_semester.ends_at);
    this.secondSemesterEndEvents.forEach(secondSemEndEvent => {
      const eventIndex = currentAcademicYearCalendar.second_semester.events.findIndex(element => element.event_type === secondSemEndEvent);
      if (eventIndex !== -1) {
        endDateStringsArray.push(currentAcademicYearCalendar.second_semester.events[eventIndex].ends_at);
      }
    });
    return endDateStringsArray;
  }

  handleSemesterDateChange($event: { date: Date, key: string, errorMessage: string }, semester, element): void {
    const academicYearEndDate = getStudyYearEndDate(DateValidator.formatDateMMDDYYYY(this.currentAcademicYear.first_semester.starts_at));
    let hasError;
    let formattedDate;
    this.hasModifiedData = true;
    this.currentAcademicYear[semester][element] = convertDateToString($event.date);
    this.currentAcademicYearErrorMessages[semester][element] = '';

    if ($event.errorMessage) { // If we have error message emitted on this.dateChanged from date-range-input don't do the other checks
      this.currentAcademicYearErrorMessages[semester][element] = $event.errorMessage;
      return;
    } else if ($event.date > academicYearEndDate) {
      this.currentAcademicYearErrorMessages[semester][element] = 'Data introdusă trebuie să fie înainte de finalul anului școlar';
      return;
    }

    switch (semester) {
      case 'first_semester':
        if (this.currentAcademicYear['second_semester']['starts_at']) {
          formattedDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['second_semester']['starts_at']);
          hasError = DateValidator.isValidFirstSemesterEnd(DateValidator.formatDateMMDDYYYY(this.currentAcademicYear[semester][element]),
            null, formattedDate);
        }
        break;
      case 'second_semester':
        if (this.currentAcademicYear['first_semester']['ends_at'] && element[0] === 'starts_at') {
          formattedDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['first_semester']['ends_at']);
          hasError = DateValidator.isValidFirstSemesterEnd(DateValidator.formatDateMMDDYYYY(this.currentAcademicYear[semester][element]),
            formattedDate, null);
        }
    }
    this.currentAcademicYearErrorMessages[semester][element] = hasError ? hasError : '';
  }

  deleteEvent(eventList, errorEventList, i: number, eventToDelete?): void {
    this.hasModifiedData = true;
    eventList.splice(i, 1);
    errorEventList.splice(i, 1);
    if (eventToDelete && eventToDelete.event_type === 'SECOND_SEMESTER_END_IX_XI_FILIERA_TEHNOLOGICA') {
      this.checkSecondSemesterPublicHolidaysDates(eventList);
    }
  }

  checkSecondSemesterPublicHolidaysDates(eventList): void {
    const startDate = DateValidator.formatDateMMDDYYYY(this.currentAcademicYear['second_semester']['starts_at']);
    const endDate = DateValidator.formatDateMMDDYYYY(getMaxDateString(this.getSecondSemesterEndEventsDates(this.currentAcademicYear)));
    eventList.forEach(event => {
      if (event.event_type === 'LEGAL_PUBLIC_HOLIDAY') {
        const eventIndex = eventList.findIndex(element => element.id === event.id);
        if (!DateValidator.checkDateIsInRange(DateValidator.formatDateMMDDYYYY(event.starts_at), startDate, endDate)) {
          this.currentAcademicYearErrorMessages['second_semester'].events[eventIndex]['starts_at'] = 'Data introdusă trebuie să se încadreze în intervalul semestrului';
        } else {
          this.currentAcademicYearErrorMessages['second_semester'].events[eventIndex]['starts_at'] = '';
        }
        if (!DateValidator.checkDateIsInRange(DateValidator.formatDateMMDDYYYY(event.ends_at), startDate, endDate)) {
          this.currentAcademicYearErrorMessages['second_semester'].events[eventIndex]['ends_at'] = 'Data introdusă trebuie să se încadreze în intervalul semestrului';
        } else {
          this.currentAcademicYearErrorMessages['second_semester'].events[eventIndex]['ends_at'] = '';
        }
      }
    });
  }

  submit(): void {
    this.hasUnfilledFields = false;
    this.hasErrors = false;
    this.checkObject(this.currentAcademicYear, this.currentAcademicYearErrorMessages);
    if (!this.hasUnfilledFields && !this.hasErrors) {
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
            } else if (['first_semester', 'second_semester'].includes(key) && (requiredFields[key]['starts_at'] || requiredFields[key]['ends_at'])) {
              this.hasErrors = true;
            } else {
              this.checkObject(data, requiredFields[key]);
            }
          }
        }
      });
  }

  checkArray(array, requiredFields) {
    array.forEach((event, index) => {
      let referenceStartDate;
      let referenceEndDate;

      if (requiredFields[index]['ends_at'] === this.eventsOverlappingErrorMessage) {
        requiredFields[index]['ends_at'] = null;
      }
      if (requiredFields[index]['starts_at'] === this.eventsOverlappingErrorMessage) {
        requiredFields[index]['starts_at'] = null;
      }

      if (event['starts_at']) {
        referenceStartDate = DateValidator.formatDateMMDDYYYY(event['starts_at']);
      } else {
        requiredFields[index]['starts_at'] = InputValidator.isRequiredError(event['starts_at']);
      }
      if (event['ends_at']) {
        referenceEndDate = DateValidator.formatDateMMDDYYYY(event['ends_at']);
      } else {
        requiredFields[index]['ends_at'] = InputValidator.isRequiredError(event['ends_at']);
      }
      if (!event['event_type']) {
        requiredFields[index]['event_type'] = InputValidator.isRequiredError(event['event_type']);
      }

      if (!requiredFields[index]['starts_at'] && referenceStartDate && referenceEndDate) {
        requiredFields[index]['starts_at'] = DateValidator.isDateUnique(referenceStartDate, referenceEndDate, array, index) ? null : this.eventsOverlappingErrorMessage;
        if (!requiredFields[index]['ends_at']) {
          requiredFields[index]['ends_at'] = requiredFields[index]['starts_at'];
        }
      }
      if (requiredFields[index]['ends_at'] || requiredFields[index]['starts_at'] || requiredFields[index]['event_type']) {
        this.hasUnfilledFields = true;
        this.hasModifiedData = true;
        this.hasErrors = true;
      }
    });
  }

  @HostListener('window:beforeunload')
  refreshGuard() {
    return !this.hasModifiedData;
  }

}
