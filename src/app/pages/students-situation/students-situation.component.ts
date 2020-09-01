import {Component, Injector} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {UserDetails} from '../../models/user-details';
import {ListPage} from '../list-page/list-page';
import {IdText} from '../../models/id-text';
import {getCurrentAcademicYear} from '../../shared/utils';
import {HttpClient} from '@angular/common/http';
import {Params, Router} from '@angular/router';
import {NetworkingListResponse} from '../../models/networking-list-response';
import BaseRequestParameters from '../list-page/base-request-parameters';
import {PupilStatisticsList, PupilStatisticsListOrs} from '../../models/pupil-statistics-list';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

class RequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly academic_year: number;
  readonly academic_profile: number;
  readonly study_class_grade: string;
  readonly ordering: string;
  readonly page_size: number;

  constructor(newObj?: any) {
    super();
    this.search = newObj?.search;
    this.academic_year = newObj?.academicYear;
    this.academic_profile = newObj?.academicProfile;
    this.study_class_grade = newObj?.studyClassGrade;
    this.ordering = newObj?.ordering;
    this.page_size = newObj?.page_size;
  }
}

@Component({
  selector: 'app-students-situation',
  templateUrl: './students-situation.component.html',
  styleUrls: ['./students-situation.component.scss']
})
export class StudentsSituationComponent extends ListPage {

  accountRole: string;
  students: PupilStatisticsListOrs[] | PupilStatisticsList[] = [];
  studentsTotalCount: number;

  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});
  readonly defaultSortingCriterion: IdText = new IdText({id: 'student_name', text: 'Nume'});

  constructor(injector: Injector,
              private accountService: AccountService,
              private http: HttpClient) {
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
    this.customUrlParamsChange({'ordering': this.defaultSortingCriterion?.id, 'academicYear': this.defaultAcademicYear?.id});

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams);
    });
  }

  // TODO: Remove this mock method once we test it thoroughly
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

      // MOCK
      // student.avg_sem1 = student.avg_sem1 || 4;
      // student.avg_sem2 = student.avg_sem2 || 5;
      // student.avg_final = student.avg_final || 5;
      // student.labels = student.labels?.length ? student.labels : ['Inregistrat proiect ORS', 'exmatriculat', 'corigent'];
      // student.unfounded_abs_count_sem1 = student.unfounded_abs_count_sem1 || 4;
      // student.unfounded_abs_count_sem2 = student.unfounded_abs_count_sem2 || 6;
      // student.unfounded_abs_count_annual = student.unfounded_abs_count_annual || 3;
      // ENDMOCK

      return student;
    });
  }

  requestData(urlParams?: Params): void {
    this.requestInProgress = true;
    const httpParams = new RequestParams({...urlParams, page_size: 100}).getHttpParams();
    const path = 'pupils-statistics/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      if (this.accountRole === 'ADMINISTRATOR') {
        this.students = this.formatData(response.results);
      } else {
        this.students = this.formatData(response.results);
      }
      this.studentsTotalCount = response.count;
      this.requestInProgress = false;
    });
  }

  changeRequestedAcademicYear(value) {
    this.academicYearToRequest = value?.id;
    this.studyClassAvailableGradesService.getData(true, this.academicYearToRequest).pipe(catchError(() => of(null)))
      .subscribe(availableClassGrade => {
        this.filterData.studyClassGrades = availableClassGrade;
      });
  }

  onLinkClick(event) {
    console.log(event);
    switch (event.cellIdentifier) {
      case 'student_all_subjects': {
        this.router.navigateByUrl(`/my-classes/${event?.dataRow?.student_in_class?.id}/students/${event.dataRow.student.id}/catalog`);
      }
    }
  }

}
