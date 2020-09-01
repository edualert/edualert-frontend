import {Component, OnInit} from '@angular/core';
import {ManageSchoolCalendarBaseClass} from '../manage-school-calendar';
import {getCurrentAcademicYear, academicYearStart} from '../../../shared/utils';
import * as moment from 'moment';

@Component({
  selector: 'app-view-study-year',
  templateUrl: './view-study-year.component.html',
  styleUrls: ['./view-study-year.component.scss']
})
export class ViewStudyYearComponent extends ManageSchoolCalendarBaseClass implements OnInit {
  firstSemesterEventList: any;
  secondSemesterEventList: any;
  otherEventList: any;
  extraEventsStartDate: any;
  extraEventsEndDate: any;
  isEditable: boolean = false;
  eventCategoryVisualMapping = {
    0: {
      title: "Începutul și sfârșitul semestrului",
      color: "#4B5B6E"
    },
    1: {
      title: "Vacanță",
      color: "#FFB300"
    },
    2: {
      title: "Sărbătoare legală",
      color: "#19AE1C"
    }
  };
  extraEventCategoryVisualMapping = {
    3: {
      title: "Corigențe",
      color: "#FF0241"
    },
    4: {
      title: "Diferențe",
      color: "#E500FF"
    }
  }
  eventTypeToCategory = {
    "SECOND_SEMESTER_END_VIII_GRADE": 0,
    "SECOND_SEMESTER_END_XII_XIII_GRADE": 0,
    "SECOND_SEMESTER_END_IX_XI_FILIERA_TEHNOLOGICA": 0,
    "I_IV_GRADES_AUTUMN_HOLIDAY": 1,
    "WINTER_HOLIDAY": 1,
    "SPRING_HOLIDAY": 1,
    "LEGAL_PUBLIC_HOLIDAY": 2,
    "CORIGENTE": 3,
    "DIFERENTE": 4
  }

  eventTypesNames = {
    "SECOND_SEMESTER_END_VIII_GRADE": {
      name: "Final semestrul II clasa a VIII-a"
    },
    "SECOND_SEMESTER_END_XII_XIII_GRADE": {
      name: "Final semestrul II clasa a XII-a & a XIII-a seral & frecvență redusă"
    },
    "SECOND_SEMESTER_END_IX_XI_FILIERA_TEHNOLOGICA": {
      name: "Final semestrul II clasele IX-XI, Filieră Tehnologică"
    },
    "I_IV_GRADES_AUTUMN_HOLIDAY": {
      name: "Vacanță de toamnă clasele I-IV"
    },
    "WINTER_HOLIDAY": {
      name: "Vacanță de iarnă"
    },
    "SPRING_HOLIDAY": {
      name: "Vacanță de primăvară"
    },
    "LEGAL_PUBLIC_HOLIDAY": {
      name: "Sărbătoare legală"
    },
    "CORIGENTE": {
      name: "Corigențe"
    },
    "DIFERENTE": {
      name: "Diferențe"
    }
  }

  setCurrentAcademicYearFromFetch(response) {
    super.setCurrentAcademicYearFromFetch(response);
    this.generateEventList();
    this.isEditable = moment().isBefore(academicYearStart.clone().set("year", getCurrentAcademicYear()));
  }

  generateEventList() {
    this.firstSemesterEventList = this.currentAcademicYear.first_semester.events.map(event => {
      return {
        eventType: this.eventTypeToCategory[event.event_type],
        startDate: event.starts_at,
        endDate: event.ends_at
      }
    });
    this.secondSemesterEventList = this.currentAcademicYear.second_semester.events.map(event => {
      return {
        eventType: this.eventTypeToCategory[event.event_type],
        startDate: event.starts_at,
        endDate: event.ends_at
      }
    });
    this.otherEventList = this.currentAcademicYear.events.map(event => {
      return {
        eventType: this.eventTypeToCategory[event.event_type],
        startDate: event.starts_at,
        endDate: event.ends_at
      }
    });
    this.extraEventsStartDate = this.currentAcademicYear.events[0]?.starts_at;
    this.extraEventsEndDate = this.currentAcademicYear.events[this.currentAcademicYear.events.length - 1]?.ends_at;
  }
}
