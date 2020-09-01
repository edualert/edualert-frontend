import {IdFullname} from './id-fullname';

export class InactiveParent extends IdFullname {
  children: IdFullname[];
  last_online: string;
  student_full_name: string;
  student_id: number | string;

  constructor(object?: any) {
    super(object);
    this.last_online = object?.last_online;

    if (object.children.length > 0) {
      this.children = [];
      object.children.forEach( child => {
        this.children.push(new IdFullname(child));
      });
      this.student_full_name = this.children[0].full_name;
      this.student_id = this.children[0].id;
    }
  }

}
