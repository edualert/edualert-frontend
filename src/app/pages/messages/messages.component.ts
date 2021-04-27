import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
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
  readonly page_size: number;
  readonly page: number;

  constructor(newObj: { search?, createdDate?, page_size?, page? }) {
    super();
    this.search = newObj?.search;
    this.created = newObj?.createdDate;
    this.page_size = newObj?.page_size;
    this.page = newObj?.page;
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
  today: Date;
  isDatePickerOpen: boolean = false;

  convertStringToDate = convertStringToDate;

  constructor(injector: Injector) {
    super(injector);
    this.today = new Date();

    this.initFilters({
      createdDate: null
    });

    injector.get(AccountService).account.subscribe((account: UserDetails) => {
      this.accountRole = account.user_role;
    });
  }

  openPicker() {
    this.datepicker.open();
    this.isDatePickerOpen = true;
  }

  openUserModal(event, id) {
    event.stopPropagation();
    this.appViewUserModal.open(id);
  }
}
