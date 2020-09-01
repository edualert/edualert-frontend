import {IdFullname} from './id-fullname';

export class Teacher extends IdFullname {

  taught_subjects: number[];

  constructor(object?: any) {
    super(object);
    this.taught_subjects = object?.taught_subjects;
  }

}

export class InactiveTeacher extends IdFullname {
  last_change_in_catalog: string;

  constructor(object?: any) {
    super(object);
    this.last_change_in_catalog = object?.last_change_in_catalog;
  }

}
