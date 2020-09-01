export class NewCatalogGrade {
  grade: number;
  taken_at: string;
  grade_type: grade_types;

  constructor(data?: any) {
    if (data) {
      this.grade = data.grade;
      this.taken_at = data.taken_at;
      this.grade_type = data.grade_type;
    }
  }
}

type grade_types = 'REGULAR' | 'THESIS';
