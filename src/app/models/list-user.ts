export class ListUser {
  id: number;
  full_name: number;
  user_role: string;
  is_active: boolean;
  last_online: string;
  labels: string[];

  constructor(obj) {
    this.id = obj.id;
    this.full_name = obj.full_name;
    this.user_role = obj.user_role;
    this.is_active = obj.is_active;
    this.last_online = obj.last_online;
    this.labels = obj.labels;
  }
}
