export class IdText {
  id: number | string;
  text: string;

  constructor(object?: any) {
    this.id = object?.id;
    this.text = object?.text;
  }
}
