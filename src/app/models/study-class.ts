import {TeacherClassThrough} from './teacher-class-through';
import {IdFullname} from './id-fullname';

export class ClassSubject {

  subject_id: number;
  subject_name: string;
  is_mandatory: boolean;

  constructor(object?: any) {
    this.subject_id = object?.id;
    this.subject_name = object?.name;
    this.is_mandatory = object?.is_mandatory;
  }
}

export class StudyClass {
  id: number;
  class_grade: string;
  class_letter: string;
  academic_program?: string;
  academic_program_name?: string;
  has_previous_catalog_data: boolean;
  academic_year?: number;
  class_master?: IdFullname;
  teachers_class_through?: TeacherClassThrough[];
  students?: IdFullname[];
  updated_teachers?: {id: number, teacher: number}[];
  new_students: number[];
  deleted_students: number[];

  constructor(data) {
    if (data) {
      this.id = data.id;
      this.class_grade = data.class_grade;
      this.class_letter = data.class_letter;
      this.academic_program = data.academic_program;
      this.academic_program_name = data.academic_program_name;
      this.has_previous_catalog_data = data.has_previous_catalog_data;

      if (data.class_master && data.teachers_class_through && data.students && data.academic_year) {  // is detail object
        this.class_master = new IdFullname(data.class_master);
        this.teachers_class_through = data.teachers_class_through ? data.teachers_class_through.map(teacher_class => new TeacherClassThrough(teacher_class)) : [];
        this.students = data.students ? data.students.map(student => new IdFullname(student)) : [];
        this.academic_year = data.academic_year;
      }
      if (data.subjects) { // clone object
        this.class_master = new IdFullname(data.class_master);
        this.teachers_class_through = data.subjects ? data.subjects.map(subject => new TeacherClassThrough(subject)) : [];
        this.students = data.students ? data.students.map(student => new IdFullname(student)) : [];
      }
    }
  }
}


export class OwnStudyClass extends StudyClass {
  study_class_id: number;
  is_class_master?: boolean;
  subjects: string;
  subjectId: string;

  constructor(data) {
    super(data);

    if (data) {
      this.study_class_id = data.study_class_id;
      this.subjectId = '';
      this.subjects = '';
      data.subjects.forEach(element => {
        this.subjectId += this.subjectId === '' ? element.id : ',' + element.id;
        this.subjects += element.name + ', ';
      });
      this.subjects = this.subjects.slice(0, -2);
      this.is_class_master = data.is_class_master;
    }
  }
}

export class StudyClassErrors {

  class_grade: string;
  class_letter: string;
  academic_program_name: string;
  class_master?: string;
  teachers_class_through: {
    teacher: string;
  }[];
  updated_teachers: {
    teacher: string;
  }[];
  new_students: string;
  deleted_students: string;
  students: IdFullname[];

  constructor() {
    this.class_grade = '';
    this.class_letter = '';
    this.academic_program_name = '';
    this.teachers_class_through = [];
    this.class_master = '';
    this.students = [];
  }

}

export class StudyClassRequestBody {
  academic_program_name: string;
  academic_year: number;
  class_grade: string;
  class_letter: string;
  academic_program: string;
  class_master: string | number;
  teachers_class_through: {
    teacher: number | string;
    subject: number;
  }[];
  students: number[];
  // Fields for PATCH request
  updated_teachers: {id: number, teacher: number}[];
  new_students: number[];
  deleted_students: number[];
}

export class StudyClassGrade {
  id: number;
  class_grade: string;
  class_letter: string;

  constructor(object?: any) {
    this.id = object.id;
    this.class_grade = object.class_grade;
    this.class_letter = object.class_letter;
  }
}
