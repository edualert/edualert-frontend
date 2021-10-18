import { Component, Input } from '@angular/core';
import { AccountService } from '../services/account.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavBarSize } from '../models/types';
import { userRoles } from '../models/user-roles';
import { AuthService } from '../services/auth.service';
import { UserDetails } from '../models/user-details';
import { menuLinks as globalMenuLinks } from '../shared/constants';
import { getLoginPageRoute } from '../shared/utils';
import { IdFullname } from '../models/id-fullname';
import { findIndex } from 'lodash';
import { CurrentAcademicYearService } from '../services/current-academic-year.service';
import * as moment from 'moment';
import { SchoolNamesService } from '../services/school-names.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss', './link-icons.component.scss']
})
export class NavBarComponent {
  @Input() size: NavBarSize;
  account: UserDetails;
  usersSchoolName: string;
  isOpen: boolean;
  readonly userRoles: object = userRoles;
  menuLinks = globalMenuLinks;
  children: IdFullname[];
  selectedChild: IdFullname;
  currentDate = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

  constructor(private accountService: AccountService,
              private router: Router,
              private authService: AuthService,
              private currentAcademicYear: CurrentAcademicYearService,
              private schoolNamesService: SchoolNamesService) {
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

      if (['ADMINISTRATOR', 'SCHOOL_PRINCIPAL', 'TEACHER'].includes(account.user_role)) {
        currentAcademicYear.getData().subscribe(response => {
          if (this.currentDate <= moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
            const studentsSituationIndex = findIndex(this.menuLinks[account.user_role], {path: 'students-situation'});
            if (studentsSituationIndex !== -1) {
              this.menuLinks[account.user_role].splice(studentsSituationIndex, 1);
            }
          }
        });
      }

      if (account.school_unit && ['TEACHER', 'PARENT', 'STUDENT'].includes(account.user_role)) {
        schoolNamesService.getCustomData(false, true).subscribe(response => {
          if (response && account.school_unit) {
            this.usersSchoolName = response[response.findIndex(school => school.id === account.school_unit)].name;
          }
        });
      }
    });

    accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
    });
  }

  selectChild(child: { element: IdFullname, index: number }) {
    this.accountService.selectChild(child.element.id as number);
  }

  toggleIsOpen(event) {
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }

  logout(): void {
    this.authService.logout();
    this.accountService.clearAccount();
    this.router.navigateByUrl(getLoginPageRoute());
  }
}
