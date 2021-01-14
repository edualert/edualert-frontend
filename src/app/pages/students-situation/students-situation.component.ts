import { Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { UserDetails } from '../../models/user-details';
import { ListPage } from '../list-page/list-page';
import { IdText } from '../../models/id-text';
import { getCurrentAcademicYear } from '../../shared/utils';
import { HttpClient } from '@angular/common/http';
import { Params } from '@angular/router';
import { NetworkingListResponse } from '../../models/networking-list-response';
import BaseRequestParameters from '../list-page/base-request-parameters';
import { PupilStatisticsList, PupilStatisticsListOrs } from '../../models/pupil-statistics-list';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

class RequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly academic_year: number;
  readonly academic_program: number;
  readonly study_class_grade: string;
  readonly ordering: string;
  readonly page_size: number;
  readonly page: number;

  constructor(newObj?: any) {
    super();
    this.search = newObj?.search;
    this.academic_year = newObj?.academicYear;
    this.academic_program = newObj?.academicProgram;
    this.study_class_grade = newObj?.studyClassGrade;
    this.ordering = newObj?.ordering;
    this.page_size = newObj?.page_size;
    this.page = newObj?.page;
  }
}

@Component({
  selector: 'app-students-situation',
  templateUrl: './students-situation.component.html',
  styleUrls: ['./students-situation.component.scss']
})
export class StudentsSituationComponent extends ListPage implements OnInit, OnDestroy {

  accountRole: string;
  students: PupilStatisticsListOrs[] | PupilStatisticsList[] = [];
  studentsTotalCount: number;
  tableContainer: HTMLElement;
  isDeletingFilters: boolean = false;

  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});

  constructor(injector: Injector,
              private accountService: AccountService,
              private http: HttpClient,
              private elementRef: ElementRef) {
    super(injector);

    this.accountService.account.subscribe((user: UserDetails) => {
      this.accountRole = user.user_role;
    });

    this.initFilters({
      academicYears: null,
      studyClassGrades: null,
      genericAcademicPrograms: null,
      sortCriteria: null
    });
    this.customUrlParamsChange({'academicYear': this.defaultAcademicYear?.id});

    this.scrollHandle = this.scrollHandle.bind(this);
    this.initialRequestInProgress = true;
    this.requestInProgress = true;
    this.requestDataFunc = this.requestData;
    this.initialBodyHeight = document.body.getBoundingClientRect().height;

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      if (Object.keys(urlParams).length === 0) {
        urlParams = {'academicYear': this.defaultAcademicYear?.id};
        this.customUrlParamsChange(urlParams);
      }
      this.students = [];
      this.requestedPageCount = 1;
      this.activeUrlParams = urlParams;
      if (this.isDeletingFilters) {
        this.isDeletingFilters = false;
        this.setStudyClassGradesFilter();
      } else {
        this.requestData(urlParams);
      }
    });
  }

  ngOnInit(): void {
    this.setSortingOptionsByUserRole();
  }

  private setSortingOptionsByUserRole() {
    const index = this.filterData.sortCriteria.map(function(elem) {
      return elem.id;
    }).indexOf('student_name');

    if (this.accountRole === 'ADMINISTRATOR') {
      if (index > -1) {
        this.filterData.sortCriteria.splice(index, 1);
      }
    } else {
      if (index < 0) {
        this.filterData.sortCriteria.push(new IdText({id: 'student_name', text: 'Nume'}));
      }
    }
  }

  private setStudyClassGradesFilter(academicYear?: string) {
    this.studyClassAvailableGradesService.getData(true, academicYear).pipe(catchError(() => of(null)))
      .subscribe((availableClassGrade: string[]) => {
        this.filterData.studyClassGrades = [...new Set(availableClassGrade)];
      });
  }

  private formatData(students: any) {
    return students.map((student: any) => {
      if (student.school_unit) {
        student.school = student.school_unit.name;
      }

      if (student.student_in_class) {
        student.class = `${student.student_in_class.class_grade} ${student.student_in_class.class_letter}`;
      }

      if (student.student?.full_name) {
        student.student_name = student.student.full_name;
      } else if (typeof student?.student === 'string') {
        student.student_name = student.student;
      }

      return student;
    });
  }

  requestData(urlParams?: Params): void {
    const responseStudents: any = this.students;
    const httpParams = new RequestParams({...urlParams, page_size: 50}).getHttpParams();
    const path = 'pupils-statistics/';

    this.requestInProgress = this.keepOldList;

    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      if (this.accountRole === 'ADMINISTRATOR') {
        response.results.map(result => responseStudents.push(result));
        this.students = this.formatData(responseStudents);
      } else {
        response.results.map(result => responseStudents.push(result));
        this.students = this.formatData(responseStudents);
      }
      this.studentsTotalCount = this.totalCount = response.count;
      this.elementCount = this.students.length;
      this.initialRequestInProgress = false;
      this.requestInProgress = false;
      this.keepOldList = false;
      setTimeout(() => {
          this.tableContainer = this.elementRef.nativeElement.getElementsByClassName('scrollable-container')[0];
          this.tableContainer.addEventListener('scroll', this.scrollHandle);
        },
        500);
    });
  }

  changeRequestedAcademicYear(value) {
    this.elementRef.nativeElement.getElementsByClassName('scrollable-container')[0].removeEventListener('scroll', this.scrollHandle);
    this.tableContainer.scrollTop = 0;
    this.page = 1;
    this.academicYearToRequest = value?.id;
    this.setStudyClassGradesFilter(this.academicYearToRequest);
  }

  onLinkClick(event) {
    switch (event.cellIdentifier) {
      case 'student_all_subjects': {
        this.router.navigateByUrl(`/my-classes/${event?.dataRow?.student_in_class?.id}/students/${event.dataRow.student.id}/catalog`);
      }
    }
  }

  clearFilters() {
    this.isDeletingFilters = true;
    this.tableContainer.scrollTop = 0;
    this.page = 1;
    this.deleteFilters();
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.getElementsByClassName('scrollable-container')[0].removeEventListener('scroll', this.scrollHandle);
  }

}
