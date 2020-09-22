import { Component, OnInit } from '@angular/core';
import {AccountService} from '../../services/account.service';
import {UserDetails} from '../../models/user-details';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // dummy property
  userDetails: UserDetails;
  accountRole: string;

  constructor(private accountService: AccountService, private router: Router) {
    accountService.account.subscribe((account: UserDetails) => {
      this.userDetails = account;
      this.accountRole = account.user_role;
    });
  }

  ngOnInit(): void {
  }

}
