import {IdFullname} from './id-fullname';

export class Subject {
  id: number;
  name: string;
  is_coordination: boolean;
  allow_exemption: boolean;
  is_optional: boolean;

  constructor(object: any) {
    if (object) {
      this.id = object.id;
      this.name = object.name;
      this.is_coordination = object.is_coordination;
      this.allow_exemption = object.allow_exemption;
      this.is_optional = object.is_optional;
    }
  }
}

export class ClassDetails {
  id: number;
  class_grade: string;
  class_letter: string;
  academic_year: number;
  academic_program_name: string;
  class_master: IdFullname;
  taught_subjects: Subject[];
  is_class_master: boolean;

  constructor(object: any) {
    if (object) {

      this.id = object.id;
      this.class_grade = object.class_grade;
      this.class_letter = object.class_letter;
      this.academic_year = object.academic_year;
      this.academic_program_name = object.academic_program_name;
      this.class_master = object.class_master;
      this.is_class_master = object.is_class_master;
      this.taught_subjects = [];
      if (object.taught_subjects.length > 0) {
        object.taught_subjects.forEach(subject => {
          this.taught_subjects.push(new Subject(subject));
        });
      }
    }

  }
}
