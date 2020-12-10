import {Component, HostListener, OnInit} from '@angular/core';
import {MessageCreate} from '../../../models/message-create';
import {receiverTypes} from '../../../models/receivers-types';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {StudyClassName} from '../../../models/study-class-name';
import {findIndex} from 'lodash';
import {IdText} from '../../../models/id-text';
import {IdFullname} from '../../../models/id-fullname';
import {getCurrentAcademicYear} from '../../../shared/utils';
import {InputValidator} from '../../../services/field-validation';

@Component({
  selector: 'app-messages-create',
  templateUrl: './messages-create.component.html',
  styleUrls: ['./messages-create.component.scss', '../../../shared/label-styles.scss']
})
export class MessagesCreateComponent implements OnInit {
  currentAcademicYear: number;
  message: MessageCreate = new MessageCreate();
  receiverClassStudents: receiverTypes = 'CLASS_STUDENTS';
  receiverClassParents: receiverTypes = 'CLASS_PARENTS';
  receiverSingleStudent: receiverTypes = 'ONE_STUDENT';
  receiverSingleParent: receiverTypes = 'ONE_PARENT';
  hasModifiedData: boolean = false;
  hasUnsavedData: boolean = true;
  hasUnfilledFields: boolean = false;
  dropdownList: IdText[] = [];
  selectedDropdownElement: StudyClassName;
  errors = {
    'title': '',
    'target_study_class': '',
    'target_user': '',
    'body': ''
  };
  requiredFieldErrorEn = 'This field is required.';
  blankFieldErrorEn = 'This field may not be blank.';
  requiredFieldErrorRo = 'Acest câmp este obligatoriu.';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    let queryParams = {};
    this.route.queryParams.subscribe(params => {
      queryParams = params;
    });
    if (queryParams['userId']) {
      this.message.receiver_type = this.receiverSingleStudent;
      this.message.target_user = Number(queryParams['userId']);
      const userData = {element: {id: this.message.target_user, text: queryParams['userName']}};
      this.handleDropdownSelection(userData);
    } else if (queryParams['classId']) {
      this.message.receiver_type = this.receiverClassStudents;
      this.message.target_study_class = Number(queryParams['classId']);
      const userData = {element: {id: this.message.target_study_class, text: queryParams['className']}};
      this.handleDropdownSelection(userData);
    } else {
      this.message.receiver_type = this.receiverClassStudents;
    }

    this.message.send_sms = false;
    this.currentAcademicYear = getCurrentAcademicYear();
    this.getDropdownOptions();
  }

  getDropdownOptions() {
    if ([this.receiverClassStudents, this.receiverClassParents].includes(this.message.receiver_type)) {
      this.httpClient.get(`years/${this.currentAcademicYear}/study-classes-names/`).subscribe((response: StudyClassName[]) => {
        this.dropdownList = response.map((item => new IdText({id: item.id, text: `${item.class_grade} ${item.class_letter}`})));
      });
    } else if (this.message.receiver_type === this.receiverSingleStudent) {
      this.httpClient.get('students/').subscribe((response: IdFullname[]) => {
        this.dropdownList = response.map((item => new IdText({id: item.id, text: item.full_name})));
      });
    } else {
      this.httpClient.get('parents/').subscribe((response: IdFullname[]) => {
        this.dropdownList = response.map((item => new IdText({id: item.id, text: item.full_name})));
      });
    }
  }

  changeValue(event: string | number | boolean, key: string): void {
    this.hasModifiedData = true;
    this.message[key] = event;
    this.errors[key] = '';
    if (key === 'receiver_type') {
      this.getDropdownOptions();
      this.selectedDropdownElement = null;
      delete this.message.target_study_class;
      delete this.message.target_user;
    }
    if (['target_user', 'target_study_class'].includes(key)) {
      ['target_user', 'target_study_class'].map(target => this.errors[target] = '');
    }
  }

  handleDropdownSelection(object) {
    this.hasModifiedData = true;
    this.selectedDropdownElement = object.element;
    if ([this.receiverClassStudents, this.receiverClassParents].includes(this.message.receiver_type)) {
      this.changeValue(this.selectedDropdownElement?.id, 'target_study_class');
      if (this.message.target_study_class === undefined) {
        delete this.message.target_study_class;
      }
    } else {
      this.changeValue(this.selectedDropdownElement?.id, 'target_user');
      if (this.message.target_user === undefined) {
        delete this.message.target_user;
      }
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    this.errors.title = InputValidator.isRequiredError(this.message.title);
    this.errors.body = InputValidator.isRequiredError(this.message.body);
    if ([this.receiverClassStudents, this.receiverClassParents].includes(this.message.receiver_type)) {
      this.errors.target_study_class = InputValidator.isRequiredError(this.message.target_study_class);
    } else {
      this.errors.target_user = InputValidator.isRequiredError(this.message.target_user);
    }
    if (this.message.send_sms && this.message.body.length > 160) {
      this.errors.body = 'Pentru a trimite si SMS scrieți maxim 160 caractere.';
    }
    Object.keys(this.errors).forEach( key => {
      if ( this.errors[key] ) {
        isValid = false;
        return;
      }
    });
    return isValid;
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.httpClient.post('my-sent-messages/', this.message).subscribe(() => {
        this.hasUnfilledFields = false;
        this.hasUnsavedData = false;
        this.router.navigate(['messages']);
      }, (error) => {
        Object.keys(error.error).map(key => this.errors[key] = error.error[key][0]);
        this.translateErrors(this.errors);
      });
    }
  }

  translateErrors(errorsObj) {
    Object.keys(errorsObj).map(key => {
      if ([this.requiredFieldErrorEn, this.blankFieldErrorEn].includes(errorsObj[key])) {
        this.errors[key] = this.requiredFieldErrorRo;
      }
    });
  }

  @HostListener('window:beforeunload')
  refreshGuard($event) {
    if (this.hasModifiedData) {
      $event.returnValue = '';
    }
  }
}
