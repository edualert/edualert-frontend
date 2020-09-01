import { Component, Injector } from '@angular/core';
import {OwnStudyClass} from '../../models/study-class';
import {ListPage} from '../list-page/list-page';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Params, Router} from '@angular/router';
import {getCurrentAcademicYear} from '../../shared/utils';
import {AccountService} from '../../services/account.service';
import {IdText} from '../../models/id-text';


@Component({
  selector: 'app-my-classes',
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss', '../manage-classes/classes-general-styles.scss']
})
export class MyClassesComponent extends ListPage {
  classes?: {[key: string]: OwnStudyClass[]} = null;
  accountRole: string;
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});

  constructor(injector: Injector, private http: HttpClient, private accountService: AccountService) {
    super(injector);

    this.initFilters({
      academicYears: null
    });
    accountService.account.subscribe(user => {
      this.accountRole = user.user_role;
    });
    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams);
    });
  }

  moveMasterFirst = (a, b) => {
    return a.class_master ? 1 : (b.class_master ? - 1 : 0);
  }

  requestData(urlParams?: Params): void {
    this.requestInProgress = true;
    const academicYear = urlParams?.academicYear ? urlParams.academicYear.split('-')[0] : getCurrentAcademicYear();

    const path = `years/${academicYear}/own-study-classes/`;
    this.http.get(path).subscribe((response: {[key: string]: OwnStudyClass[]}) => {
      if (response) {
        this.classes = {};
        Object.keys(response).forEach(key => {
          const list = [];
          response[key].forEach(element => {
            if (element.is_class_master && key !== 'class_master') {
              return;
            }
            list.push(new OwnStudyClass(element));
          });
          this.classes[key] = list;
        });
      }
      this.requestInProgress = false;
    });
  }
}
