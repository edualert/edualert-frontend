import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {UserDetails} from '../../models/user-details';
import {HttpClient} from '@angular/common/http';
import {cloneDeep} from 'lodash';
import {ListPage} from '../list-page/list-page';
import {IdText} from '../../models/id-text';
import {getCurrentAcademicYear} from '../../shared/utils';
import {Params} from '@angular/router';
import {IdFullname} from '../../models/id-fullname';
import {ViewUserModalComponent} from '../manage-users/view-user-modal/view-user-modal.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-school-situation',
  templateUrl: './student-own-situation.component.html',
  styleUrls: ['./student-own-situation.component.scss']
})
export class StudentOwnSituationComponent extends ListPage implements OnInit, OnDestroy {
  account: UserDetails;
  selectedChild: IdFullname;
  student: UserDetails;
  academicYear: number = getCurrentAcademicYear();
  catalog: any[];
  studyClass: any;
  rip: boolean;
  activeUrlParams: Params;
  academicYearToDisplay: number;
  dataExists: boolean = false;
  initialQueryParams: Params;
  constructorSub: Subscription;
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});

  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  constructor(injector: Injector,
              private accountService: AccountService,
              private httpClient: HttpClient,
              private elementRef: ElementRef) {
    super(injector);

    this.account = accountService.account.getValue();

    this.selectedChild = this.accountService.selectedChild.getValue();
    this.constructorSub = accountService.selectedChild.subscribe((child: IdFullname) => {
      if (this.selectedChild !== child) {
        this.selectedChild = child;
        this.getData(this.activatedRoute.snapshot.queryParams);
        this.initialQueryParams = this.activatedRoute.snapshot.queryParams;
        this.dataExists = true;
      }
    });
    this.initFilters({
      academicYears: null
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      if (!this.dataExists || this.initialQueryParams !== urlParams) {
        this.getData(urlParams);
        this.dataExists = false;
      }
      this.activeUrlParams = urlParams;
      if (urlParams.academicYear) {
        this.academicYearToDisplay = parseInt(urlParams.academicYear, 10);
      } else {
        this.academicYearToDisplay = this.academicYear;
      }
    });
  }

  ngOnDestroy(): void {
    this.constructorSub.unsubscribe();
  }

  private getData(urlParams: Params): void {
    let requestUrl = this.account.user_role === 'STUDENT' ?
      `own-school-situation/` :
      `own-child-school-situation/${this.selectedChild ? this.selectedChild.id : this.account.children[0].id}/`;

    if (urlParams.academicYear) {
      requestUrl += `?academic_year=${urlParams.academicYear}`;
    }
    this.rip = true;
    this.httpClient.get(requestUrl).subscribe((response: any) => {
      this.student = new UserDetails({
        full_name: response.full_name,
        id: response.id,
        labels: response.labels,
        parents: response.parents
      });
      this.studyClass = response.study_class;
      this.catalog = [];
      this.catalog = this.formatCatalog(response.catalogs_per_subjects);
      this.rip = false;

      // These lines till the end of this method are making the table's elms (table header & rows) to have the right position, no matter how long the req is taking
      const tableElm: HTMLElement = document.getElementsByClassName('scrollable-container')[0] as HTMLElement;
      const bodyElm: HTMLElement = document.getElementsByTagName('body')[0] as HTMLElement;

      tableElm.scrollIntoView(false);
      tableElm.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
      bodyElm.scrollTop = 0;

      // Set scrollable container height
      document.body.style.overflow = 'unset';
      setTimeout(() => {
        const scrollableContainer = this.elementRef.nativeElement.getElementsByClassName('scrollable-container')[0];
        scrollableContainer.style.height = scrollableContainer.clientHeight - 15 + 'px';
      }, 400);
    });
  }

  private formatCatalog(catalog): any[] {
    return catalog ? catalog.map((subject) => {
      const subj = cloneDeep(subject);

      subj.subject = {
        teacher: subject.teacher,
        subject_name: subject.subject_name
      };
      return subj;
    }) : [];
  }

  openUserModal(event, id) {
    event.stopPropagation();
    this.appViewUserModal.open(id);
  }

}
