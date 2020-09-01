import {get} from 'lodash'
import {UserDetailsBase} from "./user-details-base";

export class RiskAlerts {
  id?: string;
  dates?: string[];
  alerted_users?: {
    id: string,
    user_role: string,
    full_name: string,
    email: string,
    phone_number: string,
  }[];

  constructor(object?: any) {
    this.id = object?.id;
    this.dates = get(object, 'dates', null) ? get(object, 'dates').map(dates => dates) : [];
    this.alerted_users = get(object, 'alerted_users', null) ? get(object, 'alerted_users').map(user => new UserDetailsBase(user)) : []
  }
}
