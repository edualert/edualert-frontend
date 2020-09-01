import {Component, Injector, ViewChild} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {ListPage} from '../list-page/list-page';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {ListUser} from '../../models/list-user';
import {AddNewUserModalComponent} from './add-new-user-modal/add-new-user-modal.component';
import {userRolesArray, userRoles} from '../../models/user-roles';
import {findIndex} from 'lodash';
import {ConfirmationModalComponent} from '../../shared/confirmation-modal/confirmation-modal.component';
import BaseRequestParameters from '../list-page/base-request-parameters';


class RequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly user_role: number;
  readonly is_active: boolean;

  constructor(newObj: { search?, user_role?, is_active? }) {
    super();
    this.search = newObj?.search;
    this.user_role = newObj?.user_role;
    this.is_active = newObj?.is_active;
  }
}

@Component({
  selector: 'app-manage.users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent extends ListPage {
  users: ListUser[] = [];
  totalCount: number;
  userRolesEnum = userRoles;
  @ViewChild('addNewUserModal', {static: false}) addNewUserModal: AddNewUserModalComponent;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;

  constructor(injector: Injector,
              private http: HttpClient,
              private accountService: AccountService) {
    super(injector);

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams);
    });

    accountService.account.subscribe(user => {
      let visibleUserRoles: any[];

      if (user.user_role === 'ADMINISTRATOR') {
        visibleUserRoles = userRolesArray.filter((element) => ['ADMINISTRATOR', 'SCHOOL_PRINCIPAL'].includes(element.id as string));
      } else {
        visibleUserRoles = userRolesArray.filter((element) => ['TEACHER', 'PARENT', 'STUDENT'].includes(element.id as string));
      }
      this.initFilters({
        userRoles: visibleUserRoles,
        userStatuses: null
      });
    });
  }


  requestData(urlParams?: Params): void {
    this.requestInProgress = true;
    const httpParams = new RequestParams(urlParams).getHttpParams();
    const path = 'users/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      this.users = response.results.map(result => new ListUser(result));
      this.totalCount = response.count;
      this.requestInProgress = false;
    });
  }

  openAddNewUserModal() {
    this.addNewUserModal.open();
  }

  activateUser(userId) {
    const path = `users/${userId}/activate/`;
    this.http.post(path, null).subscribe((response: any) => {
      this.users[findIndex(this.users, {id: userId})].is_active = response.is_active;
    });
  }

  deactivateUser(userId) {
    const path = `users/${userId}/deactivate/`;
    this.http.post(path, null).subscribe((response: any) => {
      this.users[findIndex(this.users, {id: userId})].is_active = response.is_active;
    });
  }

  openDeActivateUserModal(user: ListUser) {
    const modalData = {
      title: `Doriți să ${user.is_active ? 'dezactivați' : 'activați'} contul utilizatorului ${user.full_name}?`,
      description: `Acest utilizator ${user.is_active ? 'nu' : ''} se va mai putea autentifica ${user.is_active ? '' : 'din nou'} în contul EduAlert.`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        if (user.is_active) {
          this.deactivateUser(user.id);
        } else {
          this.activateUser(user.id);
        }
      }
    };
    this.appConfirmationModal.open(modalData);
  }
}
