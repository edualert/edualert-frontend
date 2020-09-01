import {IdFullname} from './id-fullname';
import {IdText} from './id-text';
import {StudyClassGrade} from './study-class';
import {IdName} from './id-name';

export class PupilStatisticsList {
  id: number;
  academic_program_name: string;
  avg_final: string;
  avg_sem1: string;
  avg_sem2: string;
  behavior_grade_annual: number;
  behavior_grade_limit: number;
  behavior_grade_sem1: number;
  behavior_grade_sem2: number;
  labels: IdText;
  second_examinations_count: number;
  student: IdFullname;
  student_in_class: StudyClassGrade;
  unfounded_abs_count_annual: number;
  unfounded_abs_count_sem1: number;
  unfounded_abs_count_sem2: number;

  constructor(data?) {
    this.id = data.id;
    this.academic_program_name = data.academic_program_name;
    this.avg_final = data.avg_final;
    this.avg_sem1 = data.avg_sem1;
    this.avg_sem2 = data.avg_sem2;
    this.behavior_grade_annual = data.behavior_grade_annual;
    this.behavior_grade_limit = data.behavior_grade_limit;
    this.behavior_grade_sem1 = data.behavior_grade_sem1;
    this.behavior_grade_sem2 = data.behavior_grade_sem2;
    this.labels = data.labels;
    this.second_examinations_count = data.second_examinations_count;
    this.student = data.student;
    this.student_in_class = data.student_in_class;
    this.unfounded_abs_count_annual = data.unfounded_abs_count_annual;
    this.unfounded_abs_count_sem1 = data.unfounded_abs_count_sem1;
    this.unfounded_abs_count_sem2 = data.unfounded_abs_count_sem2;
  }
}

export class PupilStatisticsListOrs {
  id: number;
  academic_program_name: string;
  avg_final: string;
  avg_sem1: string;
  avg_sem2: string;
  behavior_grade_annual: number;
  behavior_grade_limit: number;
  behavior_grade_sem1: number;
  behavior_grade_sem2: number;
  labels: IdText;
  school_unit: IdName;
  second_examinations_count: number;
  student: string;
  student_in_class: StudyClassGrade;
  unfounded_abs_count_annual: number;
  unfounded_abs_count_sem1: number;
  unfounded_abs_count_sem2: number;

  constructor(data?) {
    this.id = data.id;
    this.academic_program_name = data.academic_program_name;
    this.avg_final = data.avg_final;
    this.avg_sem1 = data.avg_sem1;
    this.avg_sem2 = data.avg_sem2;
    this.behavior_grade_annual = data.behavior_grade_annual;
    this.behavior_grade_limit = data.behavior_grade_limit;
    this.behavior_grade_sem1 = data.behavior_grade_sem1;
    this.behavior_grade_sem2 = data.behavior_grade_sem2;
    this.labels = data.labels;
    this.school_unit = data.school_unit;
    this.second_examinations_count = data.second_examinations_count;
    this.student = data.student;
    this.student_in_class = data.student_in_class;
    this.unfounded_abs_count_annual = data.unfounded_abs_count_annual;
    this.unfounded_abs_count_sem1 = data.unfounded_abs_count_sem1;
    this.unfounded_abs_count_sem2 = data.unfounded_abs_count_sem2;
  }
}
