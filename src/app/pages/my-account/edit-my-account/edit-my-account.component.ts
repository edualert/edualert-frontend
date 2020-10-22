import {Component, HostListener, Input, OnInit} from '@angular/core';
import {AccountService} from '../../../services/account.service';
import {Account} from '../../../models/account';
import {userRoles} from '../../../models/user-roles';
import {get} from 'lodash';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {InputValidator} from '../../../services/field-validation';

@Component({
  selector: 'app-edit-my-account',
  templateUrl: './edit-my-account.component.html',
  styleUrls: ['./edit-my-account.component.scss', '../../../shared/label-styles.scss']
})
export class EditMyAccountComponent implements OnInit {

  account: Account;
  availableFields: {
    class?: string;
    address?: string;
    personal_id_number?: string;
    birth_date?: string;
  };
  newPassword: {
    current_password?: string,
    new_password?: string,
    repeatNewPassword?: string,
  } = {
    current_password: null,
    new_password: null,
    repeatNewPassword: null,
  };
  errors: any = {};
  displayErrorToast: boolean = false;
  errorKey: string;
  readonly userRoles = userRoles;
  passwordFormShouldBeSubmitted: boolean = false;
  hasModifiedData: boolean = false;
  hasUnsavedData: boolean = true;
  hasUnfilledFields: boolean = false;

  addInput(event: string | number | boolean, key: string, formType = 'account'): void {
    this.hasModifiedData = true;
    this.errors[key] = '';
    this.displayErrorToast = false;
    if (formType === 'account') {
      this.account[key] = event;
    }
    if (formType === 'new_password') {
      this.newPassword[key] = event;
      this.passwordFormShouldBeSubmitted = !(event === '' && !this.newPassword['current_password'] && !this.newPassword['new_password'] && !this.newPassword['repeatNewPassword']);
    }
  }

  @HostListener('window:beforeunload')
  refreshGuard($event) {
    if (this.hasModifiedData) {
      $event.returnValue = '';
    }
  }

  isFormValid(): boolean {
    let resp = true;
    if (this.passwordFormShouldBeSubmitted) {
      Object.keys(this.newPassword).forEach(key => {
        this.errors[key] = InputValidator.isRequiredError(this.newPassword[key]);
      });
      if (this.newPassword.new_password !== this.newPassword.repeatNewPassword) {
        this.errors.repeatNewPassword = 'Parolele nu corespund!';
        this.errors.newPassword = 'Parolele nu corespund!';
      }
    }
    this.errors.full_name = InputValidator.isRequiredError(this.account.full_name);
    this.errors.email = InputValidator.isRequiredError(this.account.email) || InputValidator.validateEmail(this.account.email);
    this.errors.phone_number = InputValidator.isRequiredError(this.account.phone_number) || InputValidator.validatePhoneNumber(this.account.phone_number);
    this.errors.personal_id_number = this.account.user_role === 'STUDENT' ? InputValidator.validatePersonalID(this.account.personal_id_number) : null;

    Object.keys(this.errors).forEach(key => {
      if (this.errors[key]) {
        resp = false;
        this.displayErrorToast = true;
        this.errorKey = key;
        return;
      }
    });
    return resp;
  }

  constructor(
    private accountService: AccountService,
    private httpClient: HttpClient,
    private router: Router,
  ) {
  }

  submitForm(): void {
    if (!this.hasModifiedData) {
      this.router.navigate(['my-account']);
      return;
    }
    this.errors = {};
    const isFormValid = this.isFormValid();
    if (!isFormValid) {
      return;
    }
    if (!this.account.push_notifications_enabled) {
      this.account.push_notifications_enabled = false;
    }
    if (!this.account.email_notifications_enabled) {
      this.account.email_notifications_enabled = false;
    }
    if (!this.account.sms_notifications_enabled) {
      this.account.sms_notifications_enabled = false;
    }

    const newPasswordElementsForRequest = this.passwordFormShouldBeSubmitted
      ? {current_password: this.newPassword.current_password, new_password: this.newPassword.new_password}
      : {current_password: null, new_password: null};

    const requestBody = {...this.account, ...newPasswordElementsForRequest};
    this.httpClient.put('my-account/', requestBody).subscribe((response: any) => {
      this.hasUnsavedData = false;
      this.accountService.setAccount();
      this.router.navigate(['my-account']);
    }, (errorObject => {
      this.displayErrorToast = true;
      this.errorKey = Object.keys(errorObject['error'])[0];
      this.errors[this.errorKey] = errorObject['error'][this.errorKey];
    }));
  }

  private static constructAvailableFields(userRole: string): object {
    return {
      class: userRole === 'STUDENT',
      address: ['PARENT', 'STUDENT'].includes(userRole),
      personal_id_number: userRole === 'STUDENT',
      birth_date: userRole === 'STUDENT',
    };
  }

  ngOnInit(): void {
    this.accountService.account.subscribe(user => {
      this.account = new Account(user);
      this.availableFields = EditMyAccountComponent.constructAvailableFields(this.account?.user_role);
    });
  }

  showHidePassword(element) {
    element.inputType = element.inputType === 'password' ? 'text' : 'password';
  }

  hideErrorToast() {
    this.displayErrorToast = false;
  }

}
