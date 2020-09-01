import {receiverTypes} from './receivers-types';

export class MessageCreate {
  title: string;
  send_sms: boolean;
  receiver_type: receiverTypes;
  target_study_class: number | null;
  target_user: number | null;
  body: string;

  constructor(data?: any) {
    if (data) {
      this.title = data.title;
      this.send_sms = data.send_sms;
      this.receiver_type = data.receiver_type;
      this.target_study_class = data.target_study_class;
      this.target_user = data.target_user;
      this.body = data.body;
    }
  }
}
