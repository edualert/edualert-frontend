import {Semester} from './semester';
import {Event} from './event';

export class AcademicYearCalendar {

  academic_year: number = null;
  first_semester: Semester = null;
  second_semester: Semester = null;
  events: Event[];

  constructor(data?) {
    if (data) {
      this.academic_year = data?.academic_year || null;
      this.first_semester =  data?.first_semester || null;
      this.second_semester =  data?.second_semester || null;
      this.events =  data?.events || [];
    }
  }
}
