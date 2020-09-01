import {IdFullname} from './id-fullname';
import {IdText} from './id-text';

export class Student extends IdFullname {
  labels: IdText[];

  constructor(object: any) {
    super(object);
    this.labels = object?.lables?.map(label => new IdText(label));
  }
}
