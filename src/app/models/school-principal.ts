export enum UserTypes {
  ADMINISTRATOR = 1,
  SCHOOL_PRINCIPAL = 2,
  TEACHER = 3,
  PARENT = 4,
  STUDENT = 5
}

export class SchoolPrincipal {
  id: number;
  full_name: string;
  user_role: UserTypes;
  is_actve: boolean;
  last_online: string;
  labels: [string];

  constructor(data) {
    if (data) {
      this.id = data.id;
      this.full_name = data?.full_name || null;
      this.user_role = data?.user_role || null;
      this.is_actve = data?.is_active || null;
      this.last_online = data?.last_online || null;
      this.labels = data?.labels || [];
    }
  }
}
