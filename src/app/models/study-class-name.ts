export class StudyClassName {
  id: number;
  class_grade: string;
  class_letter: string;

  constructor(data?: any) {
    this.id = data?.id;
    this.class_grade = data?.class_grade;
    this.class_letter = data?.class_letter;
  }
}

export class StudyClassAtRisk extends StudyClassName {

  students_at_risk_count: string;
  class_full_name?: string;

  constructor(object?: any) {
    super(object);
    this.students_at_risk_count = object?.students_at_risk_count;

    if (this.class_grade && this.class_letter) {
      this.class_full_name = `Clasa ${this.class_grade} ${this.class_letter}`;
    }
  }

}
