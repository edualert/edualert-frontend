import { Component, OnInit } from '@angular/core';
import {AccountService} from '../services/account.service';
import {NavigationEnd, Router} from '@angular/router';
import {NavBarSize} from '../models/types';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent {
  navBarSize: NavBarSize = 'normal';

  constructor(private accountService: AccountService, private router: Router) {
    this.handleNavBarSize();
  }

  handleNavBarSize() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.url.includes('login-admin') || val.url.includes('login-faculty') || val.url.includes('forgot-password') || val.url.includes('reset-password')) {
          this.navBarSize = 'big';
        } else {
          this.navBarSize = 'normal';
        }
      }
    });
  }
}
