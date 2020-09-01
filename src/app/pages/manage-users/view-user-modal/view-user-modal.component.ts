import {Component, Input, ViewChild} from '@angular/core';
import {ModalComponent} from "../../../shared/modal/modal.component";
import {userRoles} from "../../../models/user-roles";
import {UserDetails} from "../../../models/user-details";
import {HttpClient} from "@angular/common/http";
import * as moment from 'moment';

@Component({
  selector: 'app-view-user-modal',
  templateUrl: './view-user-modal.component.html',
  styleUrls: ['./view-user-modal.component.scss', '../../../shared/label-styles.scss']
})
export class ViewUserModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @Input() user?: UserDetails;
  readonly userRoles = userRoles;
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

  constructor(private httpClient: HttpClient) { }

  getLabelsString(): string {
    let result = '';
    this.user?.labels?.map(el => result += el.text + ' ');
    return result;
  }

  getAlertsFormattedString(): string {
    let response = '';
    this.user.risk_alerts.dates.map(el => {response += moment(el).format('DD.MM') + ' '});
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

  cancel() : void {
    this.modal.close();
    return;
  }

}
