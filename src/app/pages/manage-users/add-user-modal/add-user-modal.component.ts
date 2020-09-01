import {Component, ElementRef, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {userRoles} from '../../../models/user-roles';
import {HttpClient} from '@angular/common/http';

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
  usernameType: 'email' | 'phone' = 'email';
  email: string = '';
  phone: string;
  confirmButtonCallback: any; // function

  constructor(private http: HttpClient) {
  }

  nameChange(name: string): void {
    this.name = name;
  }

  open(modalData: ModalData) {
    this.userRole = modalData.user_role;
    this.confirmButtonCallback = modalData.confirmButtonCallback;
    this.modal.open();
  }

  cancel() {
    this.modal.close();
  }

  confirm() {
    const reqBody = {
      full_name: this.name,
      use_phone_as_username: this.usernameType === 'phone',
      user_role: userRoles[this.userRole],
      labels: [],
      taught_subjects: []
    };
    this.usernameType === 'phone' ? reqBody['phone_number'] = this.phone : reqBody['email'] = this.email;
    this.http.post('users/', reqBody).subscribe((response) => {
      this.confirmButtonCallback(response);
      this.modal.close();
    });
  }

  switchUsername(usernameType: 'email' | 'phone') {
    this.usernameType = usernameType;

    window.setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    }, 50);
  }
}


class ModalData {
  user_role: 'ORS' | 'SCHOOL_PRINCIPAL' | 'TEACHER' | 'PARENT' | 'STUDENT';
  confirmButtonCallback: any; // function
}

