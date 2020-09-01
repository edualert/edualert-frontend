import {AcademicSubject} from './academic-subject';

export class AcademicYearGrade {
  mandatory_subjects: AcademicSubject[];
  optional_subjects: AcademicSubject[];

  constructor(data) {
    if (data) {
      this.mandatory_subjects = data.mandatory_subjects ?
        (Array.isArray(data.mandatory_subjects) ?
          data.mandatory_subjects.map(subject => {
            return new AcademicSubject(subject);
          })
          : [new AcademicSubject(data.mandatory_subjects)])
        : [];
      this.optional_subjects = data.optional_subjects ?
        (Array.isArray(data.optional_subjects) ?
          data.optional_subjects.map(subject => {
            return new AcademicSubject(subject);
          })
          : [new AcademicSubject(data.optional_subjects)])
        : [];
    }
  }
}
