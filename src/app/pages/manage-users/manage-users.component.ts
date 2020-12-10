import { AfterViewInit, Component, Injector, OnDestroy, ViewChild } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { ListPage } from '../list-page/list-page';
import { HttpClient } from '@angular/common/http';
import { Params } from '@angular/router';
import { ListUser } from '../../models/list-user';
import { AddNewUserModalComponent } from './add-new-user-modal/add-new-user-modal.component';
import { userRolesArray, userRoles } from '../../models/user-roles';
import { findIndex } from 'lodash';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { AddUsersBulkService } from '../../services/add-users-bulk.service';
import { FormBuilder } from '@angular/forms';
import { AddUsersBulkComponent } from './add-users-bulk/add-users-bulk.component';
import { ManageUsersService } from '../../services/manage-users.service';


@Component({
  selector: 'app-manage.users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
  providers: [ManageUsersService]
})
export class ManageUsersComponent extends ListPage implements AfterViewInit, OnDestroy {
  static readonly principalChangeErrorMsg = 'Acest director este alocat unei școli și nu poate fi dezactivat/șters.';
  static readonly teacherChangeErrorMsg = 'Acest profesor este alocat unei/unor clase și nu poate fi dezactivat/șters.';
  static readonly studentChangeErrorMsg = 'Acest elev nu poate fi șters deoarece are deja note sau absențe în catalog.';
  static readonly defaultChangeErrorMsg = 'Acest utilizator nu poate fi șters deoarece are deja date.';

  users: ListUser[] = [];
  userRolesEnum = userRoles;
  displayErrorToast: boolean = false;
  toastErrorMessage: string;

  bulkUserAddHasErrors: boolean;
  bulkUserErrors: any = null;
  bulkUsersSuccess: string = null;

  requestInProgress: boolean = false;
  afterDelete: boolean = false;

  @ViewChild('addNewUserModal', {static: false}) addNewUserModal: AddNewUserModalComponent;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;
  @ViewChild('appAddUsersBulk', {static: false}) appAddUsersBulkModal: AddUsersBulkComponent;

  constructor(injector: Injector,
              private http: HttpClient,
              private accountService: AccountService,
              private bulkAddUsersService: AddUsersBulkService,
              private formBuilder: FormBuilder,
              private manageUsersService: ManageUsersService) {
    super(injector);

    this.scrollHandle = this.scrollHandle.bind(this);
    this.requestDataFunc = this.requestData;
    this.initialBodyHeight = document.body.getBoundingClientRect().height;

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.users = [];
      this.requestedPageCount = 1;
      this.activeUrlParams = urlParams;
      manageUsersService.setUrlParams(urlParams);
      this.requestData(urlParams, true);
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

    manageUsersService.getUsersObservable().subscribe(info => {
      this.users = info.users;
      this.totalCount = info.totalCount;
      this.elementCount = this.users.length;
    });
  }

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll', this.scrollHandle);
  }

  requestData(urlParams?: Params, clearUsersArray?: boolean): void {
    this.requestInProgress = !this.keepOldList;
    this.initialRequestInProgress = true;

    if (urlParams) {
      this.manageUsersService.setUrlParams(urlParams);
    }
    const requestPromise = clearUsersArray
      ? this.manageUsersService.refreshUsers()
      : this.manageUsersService.requestUsers(this.afterDelete);

    requestPromise.then(() => {
      this.initialRequestInProgress = false;
      this.requestInProgress = false;
      this.keepOldList = false;
      this.afterDelete = false;
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
    }, (error) => {
      if (error.error.new_school_principal) {
        this.displayErrorToast = true;
        this.toastErrorMessage = ManageUsersComponent.principalChangeErrorMsg;
      } else if (error.error.new_teachers) {
        this.displayErrorToast = true;
        this.toastErrorMessage = ManageUsersComponent.teacherChangeErrorMsg;
      }
    });
  }

  openDeActivateUserModal(user: ListUser, event?: any) {
    event.stopPropagation();
    const modalData = {
      title: `Doriți să ${user.is_active ? 'dezactivați' : 'activați'} contul utilizatorului ${user.full_name}?`,
      description: `Acest utilizator ${user.is_active ? 'nu' : ''} se va ${user.is_active ? 'mai' : ''} putea autentifica ${user.is_active ? '' : 'din nou'} în contul EduAlert.`,
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

  openDeleteUserModal(user: ListUser, event?: any) {
    event.stopPropagation();
    const modalData = {
      title: `Doriți să ștergeți contul utilizatorului ${user.full_name}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.http.delete(`users/${user.id}/`).subscribe((response) => {
          if (response === null) {
            this.users.splice(findIndex(this.users, {id: user.id}), 1);
            this.totalCount -= 1;
            if (this.users.length < this.totalCount) {
              this.afterDelete = true;
              this.requestData({...this.activeUrlParams, page_size: 1, page: this.users.length + 1}, false);
            }
          }
        }, (error) => {
          if (error.status === 400) {
            this.displayErrorToast = true;
            switch (user.user_role) {
              case 'SCHOOL_PRINCIPAL':
                this.toastErrorMessage = ManageUsersComponent.principalChangeErrorMsg;
                break;
              case 'TEACHER':
                this.toastErrorMessage = ManageUsersComponent.teacherChangeErrorMsg;
                break;
              case 'STUDENT':
                this.toastErrorMessage = ManageUsersComponent.studentChangeErrorMsg;
                break;
              default:
                this.toastErrorMessage = ManageUsersComponent.defaultChangeErrorMsg;
            }
          }
        });
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  hideErrorToast() {
    this.toastErrorMessage = '';
    this.displayErrorToast = false;
  }

  uploadUsersList(usersList: File) {
    const uploadForm = this.createUploadForm(usersList);
    this.requestInProgress = true;
    this.bulkAddUsersService.uploadFile(uploadForm).subscribe(response => {
      this.setModalStateFromResponse(response);
      this.appAddUsersBulkModal.open();
      this.requestInProgress = false;
    }, err => {
      this.setModalStateFromResponse(err);
      this.appAddUsersBulkModal.open();
      this.requestInProgress = false;
    });
  }

  private setModalStateFromResponse(response: any) {
    if (response.hasOwnProperty('errors') && Object.keys(response?.errors).length > 0 || response.hasOwnProperty('message')) {
      this.bulkUserAddHasErrors = true;
      this.bulkUserErrors = response.hasOwnProperty('errors') ? response?.errors : response?.message;
      this.bulkUsersSuccess = response?.report;
    } else if (response.hasOwnProperty('report') && !Object.keys(response?.errors).length) {
      this.bulkUserAddHasErrors = false;
      this.bulkUsersSuccess = response?.report;
    }
  }

  private createUploadForm(usersList: File): FormData {
    const uploadForm = this.formBuilder.group({
      file: ['']
    });
    uploadForm.get('file').setValue(usersList);

    const formData = new FormData();
    formData.append('file', uploadForm.get('file').value);
    return formData;
  }

}
