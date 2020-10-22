import {get} from 'lodash';
import {IdText} from './id-text';
import {IdName} from './id-name';
import {IdFullname} from './id-fullname';
import {RiskAlerts} from './risk-alerts';
import {UserDetailsBase} from './user-details-base';

export class UserDetails extends UserDetailsBase {
  username: string;
  full_name: string;
  user_role: string;
  use_phone_as_username: string;
  is_active: string;
  last_online: string;
  labels?: IdText[];
  taught_subjects?: IdName[];
  parents?: IdFullname[] | UserDetailsBase[];
  class_grade?: string;
  class_letter?: string;
  class_id?: string;
  personal_id_number?: string;
  birth_date?: string;
  educator_full_name?: string;
  educator_email?: string;
  educator_phone_number?: string;
  risk_alerts?: RiskAlerts;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  push_notifications_enabled?: boolean;
  password?: string;
  current_password?: string;
  new_password?: string;
  children?: IdFullname[];

  constructor(value?: any) {
    super(value);
    if (value) {
      this.username = get(value, 'username', null);
      this.username = get(value, 'full_name', null);
      this.user_role = get(value, 'user_role', null);
      this.use_phone_as_username = get(value, 'use_phone_as_username', null);
      this.is_active = get(value, 'is_active', null);
      this.last_online = get(value, 'last_online', null);
      this.labels = get(value, 'labels', null) ? get(value, 'labels').map(label => new IdText(label)) : [];
      this.taught_subjects = get(value, 'taught_subjects', null) ? get(value, 'taught_subjects').map(taught_subjects => new IdName(taught_subjects)) : [];
      this.parents = get(value, 'parents', null) ? get(value, 'parents').map(parents => new UserDetailsBase(parents)) : [];
      this.children = get(value, 'children', null) ? get(value, 'children', null).map( child => new IdFullname(child)) : [];
      this.class_grade = value.hasOwnProperty('student_in_class') ? get(value, 'student_in_class.class_grade', null) : get(value, 'class_grade');
      this.class_letter = value.hasOwnProperty('student_in_class') ? get(value, 'student_in_class.class_letter', null) : get(value, 'class_letter');
      this.class_id = get(value, 'student_in_class.id', null) ;
      this.personal_id_number = get(value, 'personal_id_number', null);
      this.birth_date = get(value, 'birth_date', null);
      this.educator_full_name = get(value, 'educator_full_name', null);
      this.educator_email = get(value, 'educator_email', null);
      this.educator_phone_number = get(value, 'educator_phone_number', null);
      this.risk_alerts = get(value, 'risk_alerts', null) ? new RiskAlerts(get(value, 'risk_alerts')) : {};
      this.email_notifications_enabled = get(value, 'email_notifications_enabled', null);
      this.sms_notifications_enabled = get(value, 'sms_notifications_enabled', null);
      this.push_notifications_enabled = get(value, 'push_notifications_enabled', null);
      this.password = get(value, 'password', null);
    }
  }
}
