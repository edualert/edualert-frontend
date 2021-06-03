import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { UserDetails } from '../../models/user-details';
import { ActivatedRoute, Router } from '@angular/router';
import { orsTabs } from './reports-tabs';
import { ViewUserModalComponent } from '../manage-users/view-user-modal/view-user-modal.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  accountRole: string;
  initialQueryParams: string = '';

  constructor(private accountService: AccountService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.activatedRoute.queryParams.subscribe((urlParam: any) => {
      const top_tab = urlParam['top_tab'];
      const bottom_tab = urlParam['bottom_tab'];
      if (bottom_tab && top_tab) {
        this.initialQueryParams = `${top_tab}-${bottom_tab}`;
      } else if (top_tab) {
        this.initialQueryParams = `${top_tab}`;
      } else {
        if (this.initialQueryParams && !top_tab && !bottom_tab) {
          const split = this.initialQueryParams.split('-');
          this.changeUrlParams({
            top_tab: split.length > 0 ? split[0] : null,
            bottom_tab: split.length > 1 ? split[1] : null,
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.accountService.account.subscribe((account: UserDetails) => {
      this.accountRole = account.user_role;
      if (this.initialQueryParams) {
        return;
      }
      // The initial query params for SCHOOL_PRINCIPAL / TEACHER will be configured inside
      // the reports-principal / reports-teacher component, after building the tabs.
      switch (this.accountRole) {
        case 'ADMINISTRATOR':
          this.initialQueryParams = 'enrolled_institutions';
          break;
        case 'PARENT':
          this.initialQueryParams = 'student_school_activity';
          break;
        case 'STUDENT':
          this.initialQueryParams = 'student_school_activity';
      }
    });
  }

  changeUrlParams(newParams: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  openUserModal(event) {
    this.appViewUserModal.open(event);
  }

}
