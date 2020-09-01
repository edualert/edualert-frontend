import {AcademicYearGrade} from './academic-year-grade';
import {IdName} from './id-name';
import {AcademicSubject} from './academic-subject';

export class AcademicProgramDetails {
  id: number;
  name: string;
  classes_count: number;
  academic_year: number;
  optional_subjects_weekly_hours: { [yearGrade: string]: number };
  subjects: { [yearGrade: string]: AcademicYearGrade };
  core_subject: AcademicSubject;

  constructor(data?) {
    this.id = data?.id;
    this.name = data?.name;
    this.classes_count = data?.classes_count;
    this.academic_year = data?.academic_year;
    this.optional_subjects_weekly_hours = data?.optional_subjects_weekly_hours;
    this.subjects = data?.subjects || {};
    this.core_subject = data?.core_subject;
  }
}

export class AcademicProfile {
  id: number;
  name: string;
  classes_count?: number;

  constructor(data?) {
    this.id = data?.id;
    this.name = data?.name;
    this.classes_count = data?.classes_count;
  }
}

export class AcademicProfileAtRisk extends IdName {
  students_at_risk_count: string;

  constructor(object?: any) {
    super(object);
    this.students_at_risk_count = object?.students_at_risk_count;
  }

}
