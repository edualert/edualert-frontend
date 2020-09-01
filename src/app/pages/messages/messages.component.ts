import {Component, Injector, ViewChild} from '@angular/core';
import {ListPage} from '../list-page/list-page';
import {AccountService} from '../../services/account.service';
import {UserDetails} from '../../models/user-details';
import BaseRequestParameters from '../list-page/base-request-parameters';
import {Message} from '../../models/message';
import {DatepickerComponent} from '../../shared/datepicker/datepicker.component';
import {convertStringToDate} from '../../shared/calendar/calendar-utils';
import { ViewUserModalComponent } from '../manage-users/view-user-modal/view-user-modal.component';


export class MessagesRequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly created: string;

  constructor(newObj: { search?: string, createdDate?: string }) {
    super();
    this.search = newObj?.search;
    this.created = newObj?.createdDate;
  }
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent extends ListPage {
  @ViewChild('datepicker', {'static': true}) datepicker: DatepickerComponent;
  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;
  messages: Message[];
  totalCount: number = 0;
  accountRole: string;
  accountService: AccountService;

  convertStringToDate = convertStringToDate;

  constructor(injector: Injector) {
    super(injector);
    this.initFilters({
      createdDate: null
    });

    injector.get(AccountService).account.subscribe((account: UserDetails) => {
      this.accountRole = account.user_role;
    });
  }

  openPicker() {
    this.datepicker.open();
  }

  openUserModal(event, id) {
    event.stopPropagation();
    this.appViewUserModal.open(id);
  }
}
