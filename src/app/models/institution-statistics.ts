
export class Averages {
  id: string;
  school_unit_name?: string;
  name?: string;
  class_grade?: string;
  class_letter?: string;
  avg_sem1?: string;
  avg_sem2?: string;
  avg_annual?: string;

  constructor(object?: any) {
    this.id = object?.id;
    this.school_unit_name = object?.school_unit_name;
    this.name = object?.name;
    this.class_grade = object?.class_grade;
    this.class_letter = object?.class_letter;
    this.avg_sem1 = object?.avg_sem1;
    this.avg_sem2 = object?.avg_sem2;
    this.avg_annual = object?.avg_annual;
  }

}

export class Absences {
  id: string;
  school_unit_name?: string;
  name?: string;
  class_grade?: string;
  class_letter?: string;
  unfounded_abs_avg_sem1?: string;
  unfounded_abs_avg_sem2?: string;
  unfounded_abs_avg_annual?: string;

  constructor(object?: any) {
    this.id = object?.id;
    this.school_unit_name = object?.school_unit_name;
    this.name = object?.name;
    this.class_grade = object?.class_grade;
    this.class_letter = object?.class_letter;
    this.unfounded_abs_avg_sem1 = object?.unfounded_abs_avg_sem1;
    this.unfounded_abs_avg_sem2 = object?.unfounded_abs_avg_sem2;
    this.unfounded_abs_avg_annual = object?.unfounded_abs_avg_annual;
  }

}
