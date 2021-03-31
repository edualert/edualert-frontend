import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { UserDetails } from '../../../models/user-details';
import { Message, ReceivedMessage, SentMessage } from '../../../models/message';
import { ActivatedRoute, Router } from '@angular/router';
import { get } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { ViewUserModalComponent } from '../../manage-users/view-user-modal/view-user-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss', '../../../shared/label-styles.scss']
})
export class MessageDetailsComponent implements OnInit, OnDestroy {

  account: UserDetails;
  message: SentMessage | ReceivedMessage | any;
  sendOrReceivedTemplate: 'sent' | 'received' | 'loading' = 'loading';
  @ViewChild('userDetailsModal', {static: false}) userDetailModal: ViewUserModalComponent;
  accountSubscription: Subscription;

  constructor(private accountService: AccountService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private httpClient: HttpClient) {
  }

  openViewUserModal(id: string | number) {
    this.userDetailModal.open(id);
  }

  requestDataMessages(messageId: number): void {
    if (this.sendOrReceivedTemplate === 'loading') {
      return;
    }
    this.httpClient.get<Message>('my-' + this.sendOrReceivedTemplate + '-messages/' + messageId + '/').subscribe(response => {
      if (this.sendOrReceivedTemplate === 'sent') {
        this.message = new SentMessage(response);
      } else if (this.sendOrReceivedTemplate === 'received') {
        this.message = new ReceivedMessage(response);
        if (!this.message.is_read) {
          this.markAsRead(this.message.id);
        }
      }
    }, error => {
      if (error.status === 404) {
        this.router.navigateByUrl('').then();
      }
    });
  }

  markAsRead(messageId: number): void {
    this.httpClient.post(`my-received-messages/${messageId}/mark-as-read/`, {}).subscribe();
  }

  ngOnInit(): void {
    this.accountSubscription = this.accountService.account.subscribe((user: UserDetails) => {
      if (!user.user_role) {
        return;
      }
      this.account = user;
      if (['SCHOOL_PRINCIPAL', 'TEACHER'].includes(this.account.user_role)) {
        // School Principal user role and School Teacher user role view sent messages.
        this.sendOrReceivedTemplate = 'sent';
      } else if (['PARENT', 'STUDENT'].includes(this.account.user_role)) {
        // Parent user role and Student user role view received messages.
        this.sendOrReceivedTemplate = 'received';
      }

      this.activatedRoute.params.subscribe(params => {
        const messageId = get(params, 'messageId', null);
        this.requestDataMessages(messageId);
      });
    });
  }

  ngOnDestroy(): void {
    this.accountSubscription.unsubscribe();
  }

}
