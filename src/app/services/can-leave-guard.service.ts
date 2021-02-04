import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {EditMyAccountComponent} from '../pages/my-account/edit-my-account/edit-my-account.component';
import {EditStudyYearComponent} from '../pages/manage-school-calendar/edit-study-year/edit-study-year.component';
import {EditUserComponent} from "../pages/manage-users/add-edit-user-details/edit-user/edit-user.component";
import {AddUserComponent} from "../pages/manage-users/add-edit-user-details/add-user/add-user.component";
import {MessagesCreateComponent} from '../pages/messages/messages-create/messages-create.component';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CanLeaveAddEditSchoolGuardService implements CanDeactivate<CanComponentDeactivate> {

  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }

}

@Injectable({
  providedIn: 'root'
})
export class CanLeaveGuardService implements CanDeactivate<any> {

  canDeactivate(component: EditStudyYearComponent | EditMyAccountComponent | EditUserComponent | AddUserComponent | MessagesCreateComponent) {

    if (component.hasUnfilledFields && component.hasModifiedData) {
      return false;
    }

    if (component.hasUnsavedData && component.hasModifiedData) {
      return confirm('Doriți să continuați? Datele introduse vor fi pierdute.');
    }
    return true;
  }

}

