export enum EventTypeSecondSemester {
  SECOND_SEMESTER_END_VIII_GRADE = 'Finalul semestrului II clasa a VIII-a',
  SECOND_SEMESTER_END_XII_XIII_GRADE = 'Finalul semestrului II clasa a XII-a',
  SPRING_HOLIDAY = 'Vacanță de primăvară',
  LEGAL_PUBLIC_HOLIDAY = 'Sărbătoare legală',
  SECOND_SEMESTER_END_IX_XI_FILIERA_TEHNOLOGICA = 'Finalul semestrului II, filiera tehologica',
}

export enum EventTypesFirstSemester {
  I_IV_GRADES_AUTUMN_HOLIDAY = 'Vacanță de toamnă clasele I-IV',
  WINTER_HOLIDAY = 'Vacanță de iarnă',
  LEGAL_PUBLIC_HOLIDAY = 'Sărbătoare legală'
}

export enum EventTypesOtherEvents {
  CORIGENTE = 'Corigențe',
  DIFERENTE = 'Diferențe',
  LEGAL_PUBLIC_HOLIDAY = 'Sărbătoare legală'
}

export const eventTypesNames: {key: string, name: string}[] = Object.keys(EventTypesOtherEvents).map((key: string) => ({key: key, name: (EventTypesOtherEvents[key] as string)}));
export const eventTypesNamesFirstSemester: {key: string, name: string}[] = Object.keys(EventTypesFirstSemester).map((key: string) => ({key: key, name: (EventTypesFirstSemester[key] as string)}));
export const eventTypesNamesSecondSemester: {key: string, name: string}[] = Object.keys(EventTypeSecondSemester).map((key: string) => ({key: key, name: (EventTypeSecondSemester[key] as string)}));

export class Event {
  id: number;
  event_type: EventTypeSecondSemester | EventTypesOtherEvents | EventTypesFirstSemester;
  starts_at: string;
  ends_at: string;

  constructor(data?: any) {
    if (data) {
      this.id = data?.id;
      this.event_type = data?.event_type;
      this.starts_at = data?.starts_at;
      this.ends_at = data?.ends_at;
    }
  }
}

export class EventError {
  event_type: string = null;
  starts_at: string = null;
  ends_at: string = null;

  constructor(data?: any) {
    if (data) {
      this.event_type = data?.event_type;
      this.starts_at = data?.starts_at;
      this.ends_at = data?.ends_at;
    }
  }
}
