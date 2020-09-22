import {Component, ElementRef, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {userRoles} from '../../../models/user-roles';
import {HttpClient} from '@angular/common/http';
import {InputValidator} from '../../../services/field-validation';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss']
})
export class AddUserModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @ViewChild('usernameInput', {static: false}) usernameInput: ElementRef;
  readonly userRoles = userRoles;
  userRole: string;
  name: string = '';
  usernameType: 'email' | 'phone_number' = 'email';
  email: string = '';
  phone: string;
  confirmButtonCallback: any; // function
  taughtSubjectId: number;
  errors: any = {};

  constructor(private http: HttpClient) {
  }

  nameChange(name: string): void {
    this.errors.full_name = '';
    this.name = name;
  }

  addInput(event: string, key: string): void {
    if (key === 'name') {
      this.errors.full_name = '';
      this.name = event;
    } else if (key === 'email') {
      this.errors.email = '';
      this.email = event;
    } else if (key === 'phone_number') {
      this.errors.phone_number = '';
      this.phone = event;
    }
  }

  open(modalData: ModalData) {
    this.errors = {};
    this.name = '';
    this.email = '';
    this.phone = '';
    this.userRole = modalData.user_role;
    this.confirmButtonCallback = modalData.confirmButtonCallback;
    if (modalData.taughtSubjectId) this.taughtSubjectId = modalData.taughtSubjectId;
    this.modal.open();
  }

  cancel() {
    this.modal.close();
  }

  confirm() {
    this.errors = {};
    const reqBody = {
      full_name: this.name,
      use_phone_as_username: this.usernameType === 'phone_number',
      user_role: this.userRole,
      labels: [],
      taught_subjects: this.taughtSubjectId ? [this.taughtSubjectId] : []
    };
    if (this.userRole === 'STUDENT') reqBody['parents'] = [];
    this.usernameType === 'phone_number' ? reqBody['phone_number'] = this.phone : reqBody['email'] = this.email;

    const isValid = this.isObjectValid(reqBody);
    if (isValid) {
      this.http.post('users/', reqBody).subscribe((response) => {
        this.confirmButtonCallback(response);
        this.modal.close();
      }, error => {
        if (error.error.username) {
          this.errors[this.usernameType] = error.error[Object.keys(error.error)[0]];
        } else {
          this.errors[Object.keys(error.error)[0]] = error.error[Object.keys(error.error)[0]];
        }
      });
    }
  }

  isObjectValid(reqBody): boolean {
    let isValid = true;

    if (!reqBody.full_name || !(/\S/.test(reqBody.full_name))) {
      this.errors.full_name = InputValidator.isRequiredError(reqBody.full_name);
      isValid = false;
    }
    if (!reqBody.phone_number && reqBody.use_phone_as_username) {
      this.errors.phone_number = InputValidator.isRequiredError(reqBody.phone_number);
      isValid = false;
    }
    if (reqBody.phone_number) {
      const phoneValidation = InputValidator.validatePhoneNumber(reqBody.phone_number);
      if (phoneValidation != null) {
        this.errors.phone_number = phoneValidation;
        isValid = false;
      }
    }
    if (!reqBody.email && !reqBody.use_phone_as_username) {
      this.errors.email = InputValidator.isRequiredError(reqBody.email);
      isValid = false;
    }
    if (reqBody.email) {
      const emailValidation = InputValidator.validateEmail(reqBody.email);
      if (emailValidation != null) {
        this.errors.email = emailValidation;
        isValid = false;
      }
    }
    return isValid;
  }

  switchUsername(usernameType: 'email' | 'phone_number') {
    if (!(this.usernameType === usernameType)) {
      if (usernameType === 'email') {
        this.email = '';
        this.errors.email = '';
      } else {
        this.phone = '';
        this.errors.phone_number = '';
      }
    }
    this.usernameType = usernameType;

    window.setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    }, 50);
  }
}


class ModalData {
  user_role: 'ORS' | 'SCHOOL_PRINCIPAL' | 'TEACHER' | 'PARENT' | 'STUDENT';
  confirmButtonCallback: any; // function
  taughtSubjectId?: number;
}
