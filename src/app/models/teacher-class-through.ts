import {IdFullname} from './id-fullname';

export class TeacherClassThrough {
  id: number;
  teacher: IdFullname;
  subject_id: number;
  subject_name: string;

  constructor(data) {
    if (data) {
      this.id = data.id;
      this.teacher = new IdFullname(data.teacher);
      this.subject_id = data.subject_id;
      this.subject_name = data.subject_name;
    }
  }
}
