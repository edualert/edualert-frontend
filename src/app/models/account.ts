import {get} from 'lodash';

export class Account {
  id: number;
  school_unit: number;
  full_name: string;
  user_role: string;
  email: string;
  phone_number: string;
  use_phone_as_username: string;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  address: string;
  class_grade: string;
  class_letter: string;
  personal_id_number: string;
  birth_date: string;

  constructor(value?: any) {
    if (value) {
      this.id = get(value, 'id', null);
      this.full_name = get(value, 'full_name', null);
      this.email = get(value, 'email', null);
      this.user_role = get(value, 'user_role', null);
      this.phone_number = get(value, 'phone_number', null);
      this.use_phone_as_username = get(value, 'use_phone_as_username', null);
      this.email_notifications_enabled = get(value, 'email_notifications_enabled', null);
      this.sms_notifications_enabled = get(value, 'sms_notifications_enabled', null);
      this.push_notifications_enabled = get(value, 'push_notifications_enabled', null);
      this.address = get(value, 'address', null);
      this.class_grade = get(value, 'class_grade', null);
      this.class_letter = get(value, 'class_letter', null);
      this.personal_id_number = get(value, 'personal_id_number', null);
      this.birth_date = get(value, 'birth_date', null);
    }
  }
}
