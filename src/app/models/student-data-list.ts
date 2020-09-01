import {Student} from './student';
import {Absence, Grade} from './student-grade-absence';
import {IdFullname} from './id-fullname';
import {StudyClassName} from './study-class-name';

export class StudentDataList {
  student: Student;
  avg_sem1: string;
  avg_sem2: string;
  avg_annual: string;
  avg_final: string;
  abs_count_sem1: number;
  abs_count_sem2: number;
  abs_count_annual: number;
  founded_abs_count_sem1: number;
  founded_abs_count_sem2: number;
  founded_abs_count_annual: number;
  unfounded_abs_count_sem1: number;
  unfounded_abs_count_sem2: number;
  unfounded_abs_count_annual: number;

  constructor(object: any) {
    if (object) {
      this.student = object.student || null;
      this.avg_sem1 = object.avg_sem1 || null;
      this.avg_sem2 = object.avg_sem2 || null;
      this.avg_annual = object.avg_annual || null;
      this.avg_final = object.avg_final || null;
      this.abs_count_sem1 = object.abs_count_sem1 || null;
      this.abs_count_sem2 = object.abs_count_sem2 || null;
      this.abs_count_annual = object.abs_count_annual || null;
      this.founded_abs_count_sem1 = object.founded_abs_count_sem1 || null;
      this.founded_abs_count_sem2 = object.founded_abs_count_sem2 || null;
      this.founded_abs_count_annual = object.founded_abs_count_annual || null;
      this.unfounded_abs_count_sem1 = object.unfounded_abs_count_sem1 || null;
      this.unfounded_abs_count_sem2 = object.unfounded_abs_count_sem2 || null;
      this.unfounded_abs_count_annual = object.unfounded_abs_count_annual || null;
    }
  }
}

export class StudentBySubjectDataList extends StudentDataList {
  grades_sme1: any[];
  grades_sem2: any[];
  differences_grades_sem1: any[];
  differences_grades_sem2: any[];
  abs_sem1: any[];
  abs_sem2: any[];

  constructor(object: any) {
    super(object);
    if (object) {
      this.grades_sme1 = this.fillList(object.grades_sem1, 'grade');
      this.grades_sem2 = this.fillList(object.grades_sem2, 'grade');
      this.differences_grades_sem1 = this.fillList(object.differences_grades_sem1, 'grade');
      this.differences_grades_sem2 = this.fillList(object.differences_grades_sem2, 'grade');
      this.abs_sem1 = this.fillList(object.abs_sem1, 'absence');
      this.abs_sem2 = this.fillList(object.abs_sem2, 'absence');
    }
  }

  private fillList(data: any[], field: string): Grade[] | Absence[] {
    if (data && Array.isArray(data)) {
      if (field === 'grade') {
        return data.map(val => new Grade(val));
      }
      if (field === 'absence') {
        return data.map(val => new Absence(val));
      }
    }
    return [];
  }

}

export class StudentAtRisk {
  id: number;
  student: IdFullname;
  avg_sem1: string;
  avg_final: string;
  unfounded_abs_count_sem1: number;
  unfounded_abs_count_annual: number;
  second_examinations_count: number;
  behavior_grade_sem1: number;
  behavior_grade_annual: number;
  behavior_grade_limit: number;
  study_class: StudyClassName;

  student_full_name?: string;
  class_full_name?: string;

  constructor(object?: any) {
    this.id = object?.id;
    this.student = object?.student ? new IdFullname(object?.student) : null;
    this.avg_sem1 = object?.avg_sem1;
    this.avg_final = object?.avg_final;
    this.unfounded_abs_count_sem1 = object?.unfounded_abs_count_sem1;
    this.unfounded_abs_count_annual = object?.unfounded_abs_count_annual;
    this.second_examinations_count = object?.second_examinations_count;
    this.behavior_grade_sem1 = object?.behavior_grade_sem1;
    this.behavior_grade_annual = object?.behavior_grade_annual;
    this.behavior_grade_limit = object?.behavior_grade_limit;
    this.study_class = object?.study_class ? new StudyClassName(object?.study_class) : null;

    this.student_full_name = this.student.full_name ? this.student.full_name : null;
    this.class_full_name = this.study_class?.class_letter && this.study_class?.class_grade ?
      `${this.study_class.class_grade} ${this.study_class.class_letter}` : null;
  }
}
