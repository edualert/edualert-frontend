export class SubjectToRemove {
  id: number;
  name: string;
  teacher_class_through: {};

  constructor(object?) {
    this.id = object.id;
    this.name = object.name;
    this.teacher_class_through = object.teacher_class_through;
  }
}
