import {IdFullname} from './id-fullname';

export class StudentSettings {
  id: number;
  wants_level_testing_grade: boolean;
  wants_thesis: boolean;
  wants_simulation: boolean;
  is_exempted: boolean;
  is_enrolled: boolean;
  student?: IdFullname;

  constructor(data?) {
    this.id = data.id;
    this.wants_level_testing_grade = data.wants_level_testing_grade;
    this.wants_thesis = data.wants_thesis;
    this.wants_simulation = data.wants_simulation;
    this.is_exempted = data.is_exempted;
    this.is_enrolled = data.is_enrolled;
    this.student = data.student;
  }
}
