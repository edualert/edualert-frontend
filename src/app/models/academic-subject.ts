export class AcademicSubject {
  subject_id?: number;
  subject_name: string;
  id?: number;
  weekly_hours_count: number;

  constructor(data) {
    if (data) {
      this.subject_id = data.subject_id;
      this.subject_name = data.subject_name;
      this.id = data.id;
      this.weekly_hours_count = data.weekly_hours_count;
    }
  }
}
