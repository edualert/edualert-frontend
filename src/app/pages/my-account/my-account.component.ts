import {Component, OnInit} from '@angular/core';
import {AccountService} from "../../services/account.service";
import {Account} from "../../models/account";
import {userRoles} from "../../models/user-roles";
import {formatPhoneNumber} from "../../shared/utils";

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss', '../../shared/label-styles.scss'],
})
export class MyAccountComponent implements OnInit {
  account: Account;
  availableFields: {
    class?: string;
    address?: string;
    personal_id_number?: string;
    birth_date?: string;
  };
  readonly userRoles = userRoles;

  formatPhoneNumber = formatPhoneNumber;

  constructor(
    private accountService: AccountService,
  ) { }

  private static constructAvailableFields(userRole: string): object {
    return {
      class: userRole === 'STUDENT',
      address: ['PARENT', 'STUDENT'].includes(userRole),
      personal_id_number: userRole === 'STUDENT',
      birth_date:  userRole === 'STUDENT',
    };
  }

  ngOnInit(): void {
    this.accountService.account.subscribe(user => {
      this.account = new Account(user);
      this.availableFields = MyAccountComponent.constructAvailableFields(this.account?.user_role);
    });
  }

}
