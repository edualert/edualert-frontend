import {Component, OnInit, ViewChild} from '@angular/core';
import {AccountService} from "../../../services/account.service";
import {UserDetails} from "../../../models/user-details";
import {Message, ReceivedMessage, SentMessage} from "../../../models/message";
import {ActivatedRoute} from "@angular/router";
import {get} from 'lodash'
import {HttpClient} from "@angular/common/http";
import {ViewUserModalComponent} from "../../manage-users/view-user-modal/view-user-modal.component";

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss', '../../../shared/label-styles.scss']
})
export class MessageDetailsComponent implements OnInit {

  account: UserDetails;
  message: SentMessage | ReceivedMessage | any;
  sendOrReceivedTemplate: 'sent' | 'received' | 'loading' = 'loading';
  @ViewChild('userDetailsModal', {static: false}) userDetailModal: ViewUserModalComponent;

  constructor(
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
  ) { }

  openViewUserModal(id: string | number) {
    this.userDetailModal.open(id)
  }

  requestDataMessages(messageId: number) : void {
    if (this.sendOrReceivedTemplate === "loading") return;
    this.httpClient.get<Message>('my-' + this.sendOrReceivedTemplate + '-messages/' + messageId).subscribe(response => {
      if (this.sendOrReceivedTemplate === 'sent') {
        this.message = new SentMessage(response);
      }
      else if (this.sendOrReceivedTemplate === 'received') {
        this.message = new ReceivedMessage(response);
      }
    }, (errorObject => {
      // TODO Delete this when backend works
      this.message = new ReceivedMessage({
        "id": 1,
        "title": "Message title",
        "created": "24-02-2020T19:20:00",
        "from_user": 12,
        "from_user_full_name": "John Doe",
        "from_user_role": "TEACHER",
        "from_user_subjects": [
          "Matematica",
          "Fizica"
        ],
        "is_read": false,
        "body": 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      });
    }));
  }

  ngOnInit(): void {
    this.accountService.account.subscribe((user: UserDetails) => {
      this.account = user;
      // School Principal user role and School Teacher user role view sent messages.
      if (['SCHOOL_PRINCIPAL', 'TEACHER'].includes(this.account.user_role)) {
        this.sendOrReceivedTemplate = 'sent';
      }
      // Parent user role and Student user role view received messages.
      else if (['PARENT', 'STUDENT'].includes(this.account.user_role)) {
        this.sendOrReceivedTemplate = 'received';
      }

      this.activatedRoute.params.subscribe(params => {
        const messageId = get(params, 'messageId', null);
        this.requestDataMessages(messageId);
      });
    });
  }

}
