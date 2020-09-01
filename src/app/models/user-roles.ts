import {IdText} from './id-text';

export enum userRoles {
  ADMINISTRATOR = 'Administrator',
  SCHOOL_PRINCIPAL = 'Director',
  TEACHER = 'Profesor',
  PARENT = 'Părinte',
  STUDENT = 'Elev',
}
export const userRolesArray: IdText[] = Object.keys(userRoles).map((key: string) => ({id: key, text: (userRoles[key] as string)}));
