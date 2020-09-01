import {Component, Input, OnInit} from '@angular/core';
import {AccountService} from '../services/account.service';
import {NavigationEnd, Router} from '@angular/router';
import {NavBarSize} from '../models/types';
import {userRoles} from '../models/user-roles';
import {AuthService} from '../services/auth.service';
import {UserDetails} from '../models/user-details';
import {menuLinks as globalMenuLinks} from '../shared/constants';
import {getLoginPageRoute} from '../shared/utils';
import {IdFullname} from '../models/id-fullname';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss', './link-icons.component.scss']
})
export class NavBarComponent {
  @Input() size: NavBarSize;
  account: UserDetails;
  isOpen: boolean;
  readonly userRoles: object = userRoles;
  menuLinks = globalMenuLinks;
  children: IdFullname[];
  selectedChild: IdFullname;

  constructor(private accountService: AccountService, private router: Router, private authService: AuthService) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.isOpen = false;
      }
    });
    accountService.account.subscribe((account: UserDetails) => {
      this.account = account;
      this.isOpen = false;
      if (account.user_role === 'PARENT') {
        this.children = account.children;
      }
    });

    accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
    });
  }

  selectChild(child: {element: IdFullname, index: number}) {
      this.accountService.selectChild(child.element.id as number);
  }

  toggleIsOpen(event) {
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl(getLoginPageRoute());
  }
}
