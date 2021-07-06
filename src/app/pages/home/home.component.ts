import { Component, OnInit } from '@angular/core';
import {AccountService} from '../../services/account.service';
import {UserDetails} from '../../models/user-details';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // dummy property
  userDetails: UserDetails;
  accountRole: string;
  requestInProgress: boolean = true;

  constructor(private accountService: AccountService) {
    accountService.account.subscribe((account: UserDetails) => {
      this.userDetails = account;
      this.accountRole = account.user_role;
      this.requestInProgress = false;
    }, error => {
      this.requestInProgress = false;
    });
    if (!document.documentElement.style.getPropertyValue('--vh')) {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
  }

  ngOnInit(): void {
    this.requestInProgress = true;
    document.documentElement.style.setProperty('--chartHeightAdjust', `0px`);
  }

}
