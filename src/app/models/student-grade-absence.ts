export class Grade {
  grade: number;
  taken_at: string;
  grade_type: string;
  id: number;
  created: string;
  examination_type: string;
  grade1: number;
  grade2: number;
  minutesSinceCreation?: number; // local attribute, not from server;

  constructor(object: any) {
    if (object) {
      this.grade = object.grade;
      this.grade1 = object.grade1;
      this.grade2 = object.grade2;
      this.taken_at = object.taken_at;
      this.grade_type = object.grade_type;
      this.id = object.id;
      this.created = object.created;
      this.examination_type = object.examination_type;
      this.minutesSinceCreation = object.minutesSinceCreation;
    }
  }
}

export class Absence {
  taken_at: string;
  is_founded: boolean;
  id: number;
  created: string;

  constructor(object: any) {
    if (object) {
      this.taken_at = object.taken_at;
      this.is_founded = object.is_founded;
      this.id = object.id;
      this.created = object.created;
    }
  }
}
