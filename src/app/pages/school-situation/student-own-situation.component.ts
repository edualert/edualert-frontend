import {Component, Injector, OnChanges, OnInit} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {UserDetails} from '../../models/user-details';
import {HttpClient} from '@angular/common/http';
import {cloneDeep} from 'lodash';
import {ListPage} from '../list-page/list-page';
import {IdText} from '../../models/id-text';
import {getCurrentAcademicYear} from '../../shared/utils';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';
import {Params} from '@angular/router';
import {IdFullname} from '../../models/id-fullname';

@Component({
  selector: 'app-school-situation',
  templateUrl: './student-own-situation.component.html',
  styleUrls: ['./student-own-situation.component.scss']
})
export class StudentOwnSituationComponent extends ListPage implements OnInit {
  account: UserDetails;
  selectedChild: IdFullname;
  student: UserDetails;
  academicYear: number = 2019;
  catalog: any[];
  studyClass: any;
  rip: boolean;
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});

  constructor(injector: Injector,
              private accountService: AccountService,
              private httpClient: HttpClient) {
    super(injector);

    this.account = accountService.account.getValue();

    this.selectedChild = this.accountService.selectedChild.getValue();
    accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
      this.getData(this.activatedRoute.snapshot.queryParams);
    });
    this.initFilters({
      academicYears: [
        new IdText({id: 2018, text: '2018 - 2019'}),
        new IdText({id: 2019, text: '2019 - 2020'}),
      ]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.getData(urlParams);
    });
  }

  private getData(urlParams: Params): void {
    let requestUrl = this.account.user_role === 'STUDENT' ?
      `own-school-situation` :
      `own-child-school-situation/${this.selectedChild ? this.selectedChild.id : this.account.children[0].id}`;

    if (urlParams.academicYear) {
      requestUrl += `?academic_year=${urlParams.academicYear}`;
    }
    this.httpClient.get(requestUrl).subscribe((response: any) => {
      this.student = new UserDetails({
        full_name: response.full_name,
        id: response.id,
        labels: response.labels,
        parents: response.parents
      });
      this.studyClass = response.study_class;
      this.catalog = this.formatCatalog(response.catalogs_per_subjects);
      this.rip = false;
    });
  }

  private formatCatalog(catalog): any[] {
    return catalog.map((subject) => {
      const subj = cloneDeep(subject);

      subj.subject = {
        teacher: subject.teacher,
        subject_name: subject.subject_name
      };

      return subj;
    });
  }

}
