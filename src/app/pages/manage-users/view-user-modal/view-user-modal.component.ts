import {Component, Input, ViewChild} from '@angular/core';
import {ModalComponent} from "../../../shared/modal/modal.component";
import {userRoles} from "../../../models/user-roles";
import {UserDetails} from "../../../models/user-details";
import {HttpClient} from "@angular/common/http";
import * as moment from 'moment';
import {AccountService} from '../../../services/account.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-view-user-modal',
  templateUrl: './view-user-modal.component.html',
  styleUrls: ['./view-user-modal.component.scss', '../../../shared/label-styles.scss']
})
export class ViewUserModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @Input() user?: UserDetails;
  readonly userRoles = userRoles;
  accountRole: string;
  availableFields: {
    studyClass?: boolean,
    labels?: boolean,
    address?: boolean,
    personalNumber?: boolean,
    birthDate?: boolean,
    taughtSubjects?: boolean,
    parentSection?: boolean,
    pedagogueSection?: boolean
    risk_alerts?: boolean,
  };

  private static constructAvailableFields(userRole: string): object {
    return {
      studyClass: userRole === 'STUDENT',
      labels: ['SCHOOL_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'].includes(userRole),
      address: ['PARENT', 'STUDENT'].includes(userRole),
      personalNumber: userRole === 'STUDENT',
      birthDate: userRole === 'STUDENT',
      taughtSubjects: ['SCHOOL_PRINCIPAL', 'TEACHER'].includes(userRole),
      parentSection: userRole === 'STUDENT',
      pedagogueSection: userRole === 'STUDENT',
      risk_alerts: userRole === 'STUDENT',
    };
  }

  constructor(private httpClient: HttpClient,
              private accountService: AccountService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.accountService.account.subscribe((account: UserDetails) => {
      this.accountRole = account.user_role;
    });
  }

  getLabelsString(): string {
    let result = '';
    this.user?.labels?.map(el => result += el.text + '     ');
    return result;
  }

  getAlertsFormattedString(): string {
    let response = '';
    const datesCount = this.user.risk_alerts.dates.length;
    let index = 0;
    this.user.risk_alerts.dates.map(el => {
      index++;
      if (datesCount > 1 && index < datesCount) {
        response += moment(el).format('DD.MM') + ', ';
      } else if (datesCount === 1 || datesCount === index) {
        response += moment(el).format('DD.MM');
      }
    });
    return response;
  }

  open(userId: string | number) : void{
    if (!userId) return;

    this.httpClient.get<UserDetails>('users/' + userId + '/?include_risk_alerts=true').subscribe(response => {
      this.user = new UserDetails(response);
      this.availableFields = ViewUserModalComponent.constructAvailableFields(this.user.user_role)
    });
    this.modal.open();
    return;
  }

  cancel(): void {
    this.modal.close();
    return;
  }

  onClassNameClick() {
    if (this.accountRole === 'SCHOOL_PRINCIPAL') {
      if (this.activatedRoute.snapshot.url[0].path.includes('manage-classes')) {
        this.modal.close();
      } else {
        this.router.navigate(['/manage-classes', this.user.class_id, 'view']);
      }
    } else {
      if (this.activatedRoute.snapshot.url[0].path.includes('my-classes')) {
        this.modal.close();
      } else {
        this.router.navigate(['/my-classes', this.user.class_id, 'class-detail']);
      }
    }
  }

}
