import * as moment from 'moment';
import {userRoles} from './user-roles';
import {IdFullname} from './id-fullname';

export class CompressedStudyClass {
  id: number;
  class_grade: string;
  class_letter: string;

  constructor(obj) {
    if (obj) {
      this.id = obj.id;
      this.class_grade = obj.class_grade;
      this.class_letter = obj.class_letter;
    }
  }
}

export class UsersChildren extends IdFullname {
  study_class: CompressedStudyClass;

  constructor(obj) {
    if (obj) {
      super(obj);
      this.study_class = new CompressedStudyClass(obj.study_class);
    }
  }
}

export class UserThrough {
  user_profile: number;
  user_profile_full_name: string;
  children?: UsersChildren[];

  constructor(obj) {
    if (obj) {
      this.user_profile = obj.user_profile;
      this.user_profile_full_name = obj.user_profile_full_name;
      this.children = obj.children?.map(child => new UsersChildren(child));
    }
  }
}

export class SentStatus {
  sent_to_count: number;
  read_by_count: number;

  constructor(obj) {
    if (obj) {
      this.sent_to_count = obj.sent_to_count;
      this.read_by_count = obj.read_by_count;
    }
  }
}

export enum ReceiverTypes {
  CLASS_STUDENTS = 'Class students',
  CLASS_PARENTS = 'Class parents',
  ONE_STUDENT = 'One student',
  ONE_PARENT = 'One parent'
}

export class Message {
  id: number;
  title: string;
  created: moment.Moment;

  constructor(obj) {
    if (obj) {
      this.id = obj.id;
      this.title = obj.title;
      this.created = moment(obj.created, 'DD-MM-YYYY hh:mm');
    }
  }
}

export class SentMessage extends Message {
  send_sms: boolean;
  receiver_type: ReceiverTypes;
  target_users_role: userRoles;
  target_study_class?: CompressedStudyClass;
  target_user_through?: UserThrough;
  status: SentStatus;
  body?: string;

  constructor(obj) {
    if (obj) {
      super(obj);
      this.send_sms = obj.send_sms;
      this.receiver_type = obj.receiver_type;
      this.target_users_role = obj.target_users_role;
      this.target_study_class = new CompressedStudyClass(obj.target_study_class);
      this.target_user_through = new UserThrough(obj.target_user_through);
      this.status = new SentStatus(obj.status);
      this.body = obj.body;
    }
  }
}

export class ReceivedMessage extends Message {
  status: SentStatus;
  from_user: number;
  from_user_full_name: string;
  from_user_role: userRoles;
  from_user_subjects: string[];
  is_read: boolean;
  body?: string;

  constructor(obj) {
    if (obj) {
      super(obj);
      this.from_user = obj.from_user;
      this.from_user_full_name = obj.from_user_full_name;
      this.from_user_role = obj.from_user_role;
      this.from_user_subjects = obj.from_user_subjects;
      this.is_read = obj.is_read;
      this.body = obj.body;
    }
  }
}
