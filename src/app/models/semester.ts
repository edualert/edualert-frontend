import {Event, EventError} from './event';

export class Semester {

  id: number;
  starts_at: string;
  ends_at: string;
  events: Event[];

  constructor(data?) {
    if (data) {
      this.id = data?.id;
      this.starts_at = data?.starts_at;
      this.ends_at = data?.ends_at;
      this.events = data?.events || [];
    }
  }
}

export class SemesterError {
  starts_at: string;
  ends_at: string;
  events: EventError[];

  constructor(data?: any) {
    if (data) {
      this.events = data?.events || [];
      this.starts_at = data?.starts_at;
      this.ends_at = data?.ends_at;
    }
  }
}
