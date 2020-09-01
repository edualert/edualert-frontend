import {get} from 'lodash'

export class UserDetailsBase {
  id: number;
  full_name: string;
  user_role?: string;
  phone_number?: string;
  email?: string;
  address?: string;

  constructor(obj) {
    if (obj) {
      this.id = get(obj, 'id', null);
      this.full_name = get(obj, 'full_name', null);
      this.user_role = get(obj, 'user_role', null);
      this.phone_number = get(obj, 'phone_number', null);
      this.email = get(obj, 'email', null);
      this.address = get(obj, 'address', null);
    }
  }
}
