export class IdFullname {
  id: number | string;
  full_name: string;

  constructor(object: any) {
    this.id = object?.id;
    this.full_name = object?.full_name;
  }
}
