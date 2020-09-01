import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
  OnDestroy, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import {UserDetails} from '../../../models/user-details';
import {AccountService} from '../../../services/account.service';
import {HttpClient} from '@angular/common/http';
import {findIndex} from 'lodash';
import _ from 'lodash';
import {get} from 'lodash';
import {IdText} from '../../../models/id-text';
import {IdName} from '../../../models/id-name';
import {IdFullname} from '../../../models/id-fullname';
import {userRolesArray} from '../../../models/user-roles';
import {convertStringToDate} from '../../../shared/calendar/calendar-utils';
import {DatepickerComponent} from '../../../shared/datepicker/datepicker.component';
import * as moment from 'moment';
import {InputValidator} from '../../../services/field-validation';

@Component({
  selector: 'app-add-edit-user-details',
  templateUrl: './add-edit-user-details.component.html',
  styleUrls: ['./add-edit-user-details.component.scss', '../../../shared/label-styles.scss'],
})
export class AddEditUserDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userDetailsInput: UserDetails;
  @Input() showState: boolean;
  @Input() saveButton: any;
  @Input() isEdit: boolean;
  @Input() backendErrors: {};
  @Output() userDetailChanged: EventEmitter<UserDetails> = new EventEmitter();
  @Output() hasModifiedDataOutput: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('datepicker', {'static': true}) datepicker: DatepickerComponent;

  account: UserDetails;
  userDetails: UserDetails;
  errors: any = {};
  availableFields: {
    studyClass?: string,
    labels?: string,
    address?: string,
    personalNumber?: string,
    birthDate?: string,
    taughtSubjects?: string,
    parentSection?: string,
    pedagogueSection?: string,
    password?: string,
    newPassword?: string,
    repeatNewPassword?: string
  };
  newPassword: {
    new_password?: string,
    repeatNewPassword?: string,
  };
  userRoleDropdown = userRolesArray;
  convertStringToDate = convertStringToDate;

  passwordShouldBeSubmitted: boolean = false;

  // Extra Data
  parents: IdFullname[];
  labels: IdText[];
  subjects: IdName[];
  private readonly pathParent = 'parents/';
  private readonly pathLabel = 'labels/?user_role=';
  private readonly pathSubjects = 'subjects/';
  loadingLabels: boolean = false;
  loadingSubjects: boolean = false;

  get = get;

  constructor(
    accountService: AccountService,
    private httpClient: HttpClient,
    private changeDetector: ChangeDetectorRef,
  ) {
    accountService.account.subscribe((account: UserDetails) => {
      this.account = account;
      this.addUserRoleDropdownData(account.user_role);
    });
    this.emitFormData = this.emitFormData.bind(this);
  }

  addUserRoleDropdownData(userRole: string) {
    switch (userRole) {
      case 'ADMINISTRATOR': {
        this.userRoleDropdown = [
          {id: 'ADMINISTRATOR', text: 'Administrator'},
          {id: 'SCHOOL_PRINCIPAL', text: 'Director'},
        ];
        break;
      }
      case 'SCHOOL_PRINCIPAL': {
        this.userRoleDropdown = [
          {id: 'SCHOOL_PRINCIPAL', text: 'Director'},
          {id: 'TEACHER', text: 'Profesor'},
          {id: 'PARENT', text: 'Părinte'},
          {id: 'STUDENT', text: 'Elev'},
        ];
        break;
      }
      case 'PARENT':
      case 'STUDENT':
      case 'TEACHER': {
        this.userRoleDropdown = [
          {id: 'TEACHER', text: 'Profesor'},
          {id: 'PARENT', text: 'Părinte'},
          {id: 'STUDENT', text: 'Elev'},
        ];
        break;
      }
    }
  }

  isObjectValid(userDetails: UserDetails): boolean {
    let resp = true;
    if ( this.passwordShouldBeSubmitted ) {
      if (this.isEdit && (this.newPassword['new_password'] || this.newPassword['repeatNewPassword'])) {
        Object.keys(this.newPassword).forEach(key => {
          this.errors[key] = InputValidator.isRequiredError(this.newPassword[key]);
          resp = !this.errors[key];
        });
        if (this.newPassword.new_password !== this.newPassword.repeatNewPassword) {
          this.errors.repeatNewPassword = 'Parolele nu corespund!';
          this.errors.newPassword = 'Parolele nu corespund!';
          resp = false;
        }
      } else if (!this.isEdit && !userDetails.password) {
        this.errors.password = 'Acest câmp este obligatoriu!';
        resp = false;
      }
    }
    if (!userDetails.full_name) {
      this.errors.full_name = 'Acest câmp este obligatoriu!';
      resp = false;
    }
    if (!userDetails.user_role) {
      this.errors.user_role = 'Acest câmp este obligatoriu!';
      resp = false;
    }
    if (!userDetails.phone_number) {
      this.errors.phone_number = 'Acest câmp este obligatoriu!';
      resp = false;
    }
    if (!userDetails.email) {
      this.errors.email = 'Acest câmp este obligatoriu!';
      resp = false;
    }
    if (this.userDetails.email && (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userDetails.email) || userDetails.email?.length > 150)) {
      this.errors.email = 'Format incorect. Scrieți maxim 150 caractere în formatul: numeutilizator@numedomeniu.extensiedomeniu';
      resp = false;
    }
    if (this.userDetails.educator_email && (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userDetails.educator_email) || userDetails.educator_email?.length > 150)) {
      this.errors.educator_email = 'Format incorect. Scrieți maxim 150 caractere în formatul: numeutilizator@numedomeniu.extensiedomeniu';
      resp = false;
    }
    if (this.userDetails.phone_number && (!/^\+?[0-9]+$/.test(userDetails.phone_number) || !(userDetails.phone_number?.length >= 10 && userDetails.phone_number?.length <= 20))) {
      this.errors.phone_number = 'Format incorect. Scrieți minim 10, maxim 20 caractere: doar cifre și semnul \'+\' sunt acceptate, fără spații.';
      resp = false;
    }
    if (this.userDetails.educator_phone_number && (!/\+?[0-9]+/.test(userDetails.educator_phone_number) || !(userDetails.educator_phone_number?.length >= 10 && userDetails.educator_phone_number?.length <= 20))) {
      this.errors.educator_phone_number = 'Format incorect. Scrieți minim 10, maxim 20 caractere: doar cifre și semnul \'+\' sunt acceptate, fără spații.';
      resp = false;
    }
    if (this.userDetails.educator_phone_number === '') {
      this.userDetails.educator_phone_number = null;
    }
    if (this.userDetails.personal_id_number && !/^[1-9]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(0[1-9]|[1-4]\d|5[0-2]|99)(00[1-9]|0[1-9]\d|[1-9]\d\d)\d$/.test(userDetails.personal_id_number)) {
      this.errors.personal_id_number = 'Format incorect. Scrieți 13 caractere, fără spații.';
      resp = false;
    }
    if (userDetails.user_role === 'STUDENT' && userDetails.educator_full_name) {
      if (!userDetails.educator_email && !userDetails.educator_phone_number) {
        this.errors.educator_phone_number = 'Este obligatoriu să completați cel puțin unul dintre câmpuri: numărul de telefon sau adresa de email.';
        this.errors.educator_email = 'Este obligatoriu să completați cel puțin unul dintre câmpuri: numărul de telefon sau adresa de email.';
        resp = false;
      }
    }
    if (userDetails.birth_date && moment(userDetails.birth_date, 'DD-MM-YYYY') > moment()) {
      this.errors.birth_date = 'Data de naștere trebuie să fie în trecut!';
      resp = false;
    }
    userDetails.parents?.forEach((el, index) => {
      if (!el.id) {
        if (!this.errors.parents) {
          this.errors.parentFrontValidation = {};
        }
        this.errors.parentFrontValidation[index] = 'Acest camp nu poate ramane necompletat!';
        resp = false;
      }
    });
    return resp;
  }

  addInput(event: string | number | boolean, key: string): void {
    this.hasModifiedDataOutput.emit(true);
    if (['new_password', 'repeatNewPassword', 'password'].includes(key)) {
      this.passwordShouldBeSubmitted = true;
      if ( this.isEdit ) {
        this.newPassword[key] = event;
        if (!this.newPassword.repeatNewPassword && !this.newPassword.new_password) {
          this.passwordShouldBeSubmitted = false;
        }
      } else {
        this.userDetails[key] = event.toString();
        this.passwordShouldBeSubmitted = !!this.userDetails.password.length;

      }
      return;
    }
    this.userDetails[key] = event;
  }

  handleDropdownChange(object: { element, index }, key: string, index = null): void {
    switch (key) {
      case 'userRole': {
        this.hasModifiedDataOutput.emit(true);
        this.userDetails.user_role = object.element.id;
        this.updateUserDetails(this.userDetails);
        this.userDetails.taught_subjects = [];
        this.userDetails.labels = [];
        this.userDetails.parents = [];
        break;
      }
      case 'parent': {
        this.hasModifiedDataOutput.emit(true);
        if (!object.element) {
          return;
        }
        this.userDetails.parents[index] = object.element;
        break;
      }
    }
  }

  getUserRole(key: string): string {
    if (!key) {
      return '\0';
    }
    return this.userRoleDropdown[findIndex(this.userRoleDropdown, {id: key})]?.text;
  }

  changeCreatedDate(event: string) {
    this.hasModifiedDataOutput.emit(true);
    this.userDetails.birth_date = moment(event).format('DD-MM-YYYY');
  }

  handleLabelClicked(label: IdText): void {
    this.hasModifiedDataOutput.emit(true);
    let labelExists = false;
    if (this.userDetails.labels === undefined) {
      this.userDetails.labels = [];
    }
    this.userDetails?.labels?.forEach(el => {
      if (el.id === label.id) {
        labelExists = true;
      }
    });
    if (labelExists) {
      _.remove(this.userDetails.labels, (el: IdText) => {
        return el.id === label.id;
      });
    } else if (this.userDetails?.labels.length < 3) {
      this.userDetails.labels.push(label);
    }
  }

  handleSubjectClicked(subject: IdName): void {
    this.hasModifiedDataOutput.emit(true);
    let subjectExists = false;
    if (this.userDetails.taught_subjects === undefined) {
      this.userDetails.taught_subjects = [];
    }
    this.userDetails?.taught_subjects?.forEach(el => {
      if (el.id === subject.id) {
        subjectExists = true;
      }
    });
    if (subjectExists) {
      _.remove(this.userDetails.taught_subjects, (el: IdName) => {
        return el.id === subject.id;
      });
    } else {
      this.userDetails.taught_subjects.push(subject);
    }
  }

  addParent(): void {
    this.hasModifiedDataOutput.emit(true);
    if (this.userDetails.parents === undefined) {
      this.userDetails.parents = [];
    }
    this.userDetails.parents[this.userDetails.parents?.length] = new IdFullname({});
  }

  deleteParent(index: number): void {
    this.hasModifiedDataOutput.emit(true);
    _.remove(this.userDetails.parents, (el: IdFullname) => {
      return el.id === this.userDetails.parents[index].id;
    });
  }

  isLabelChecked(id: number): boolean {
    let resp = false;
    this.userDetails?.labels?.forEach(el => {
      if (el.id === id) {
        resp = true;
      }
    });
    return resp;
  }

  isSubjectChecked(id: number): boolean {
    let resp = false;
    this.userDetails?.taught_subjects?.forEach(el => {
      if (el.id === id) {
        resp = true;
      }
    });
    return resp;
  }

  private static constructAvailableFields(userRole: string): object {
    return {
      studyClass: userRole === 'STUDENT',
      labels: ['SCHOOL_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'].includes(userRole),
      address: ['PARENT', 'STUDENT'].includes(userRole),
      personalNumber: userRole === 'STUDENT',
      birthDate: userRole === 'STUDENT',
      taughtSubjects: ['TEACHER'].includes(userRole),
      parentSection: userRole === 'STUDENT',
      pedagogueSection: userRole === 'STUDENT',
      password: ['SCHOOL_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'].includes(userRole),
      newPassword: ['SCHOOL_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'].includes(userRole),
      repeatNewPassword: ['SCHOOL_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'].includes(userRole)
    };
  }

  getParentsFromBackend(): void {
    if (this.userDetails.user_role !== 'STUDENT') {
      return;
    }
    if (this.account.user_role !== 'SCHOOL_PRINCIPAL') {
      return;
    }
    this.httpClient.get<IdFullname[]>(this.pathParent).subscribe(response => {
      this.parents = response.map(parents => new IdFullname(parents));
    });
  }

  getSubjectsFromBackend(): void {
    if (['ADMINISTRATOR', 'STUDENT', 'PARENT'].includes(this.userDetails.user_role)) {
      return;
    }
    this.loadingSubjects = true;
    this.httpClient.get<IdName[]>(this.pathSubjects).subscribe(response => {
      this.subjects = response.map(subject => new IdName(subject));
      this.loadingSubjects = false;
    });
  }

  getLabelsFromBackend(): void {
    if (this.userDetails.user_role === 'ADMINISTRATOR') {
      return;
    }
    this.loadingLabels = true;
    this.httpClient.get<IdText[]>(this.pathLabel + this.userDetails.user_role).subscribe(response => {
      this.labels = response.map(label => new IdText(label));
      this.loadingLabels = false;
    });
  }

  updateUserDetails(userDetails: UserDetails): void {
    this.userDetails = userDetails;
    this.availableFields = AddEditUserDetailsComponent.constructAvailableFields(userDetails?.user_role);
    if (!this.userDetails || !this.userDetails.user_role) {
      return;
    }
    this.getSubjectsFromBackend();
    this.getLabelsFromBackend();
    this.getParentsFromBackend();
    this.changeDetector.detectChanges();
  }

  emitFormData(): void {
    this.errors = {};
    const isValid = this.isObjectValid(this.userDetails);
    if (isValid) {
      if ( this.passwordShouldBeSubmitted ) {
        this.userDetails.password = this.isEdit ? this.newPassword.new_password : this.userDetails.password;
      } else {
        delete this.userDetails.password;
        delete this.userDetails.new_password;
      }
      this.userDetailChanged.emit(this.userDetails);
    } else {
      this.userDetailChanged.emit(null);
    }
  }

  ngOnInit(): void {
    this.updateUserDetails(this.userDetailsInput);
    this.saveButton.addEventListener('click', this.emitFormData);
    this.isEdit ? this.newPassword = {
      new_password: null,
      repeatNewPassword: null,
    } : this.userDetails.password = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.backendErrors && !_.isEmpty(changes.backendErrors.currentValue) && changes.backendErrors.currentValue !== changes.backendErrors.previousValue) {
      Object.keys(changes.backendErrors.currentValue).forEach((el) => {
        this.errors[el] = changes.backendErrors.currentValue[el][0];
      });
    }
    if (changes.userDetailsInput && changes.userDetailsInput.currentValue) {
      this.updateUserDetails({...changes.userDetailsInput.currentValue});
      this.addUserRoleDropdownData(this.userDetails.user_role);
    }
  }

  ngOnDestroy(): void {
    this.saveButton.removeEventListener('click', this.emitFormData);
  }

  openPicker() {
    this.datepicker.open();
  }
}
