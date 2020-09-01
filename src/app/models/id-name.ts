export class IdName {
  id: number | string;
  name: string;

  constructor(object?: any) {
    this.id = object?.id;
    this.name = object?.name;
  }
}


