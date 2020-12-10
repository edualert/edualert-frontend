import {AfterViewInit, Component, Injector, OnDestroy, ViewChild} from '@angular/core';
import {SchoolUnit} from '../../models/school-unit';
import {ListPage} from '../list-page/list-page';
import {HttpClient} from '@angular/common/http';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {Params} from '@angular/router';
import {capitalizeString} from '../../shared/utils';
import {ConfirmationModalComponent} from '../../shared/confirmation-modal/confirmation-modal.component';
import {findIndex} from 'lodash';
import {IdName} from '../../models/id-name';
import BaseRequestParameters from '../list-page/base-request-parameters';
import {AddNewUserModalComponent} from '../manage-users/add-new-user-modal/add-new-user-modal.component';

class RequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly district: string; // cluj
  readonly city: string; // cluj-napoca
  readonly categories: number; // 1
  readonly academic_profile: IdName;
  readonly page_size: number;
  readonly page: number;

  constructor(newObj: { search?, district?, city?, schoolCategory?, schoolProfile?, page_size?, page? }) {
    super();
    this.search = newObj?.search;
    this.district = capitalizeString(newObj?.district, ['-']);
    this.city = capitalizeString(newObj?.city, ['-']);
    this.categories = newObj?.schoolCategory;
    this.academic_profile = newObj?.schoolProfile;
    this.page_size = newObj?.page_size;
    this.page = newObj?.page;
  }
}

@Component({
  selector: 'app-manage-schools',
  templateUrl: './manage-schools.component.html',
  styleUrls: ['./manage-schools.component.scss']
})
export class ManageSchoolsComponent extends ListPage implements AfterViewInit, OnDestroy {
  schools: SchoolUnit[] = [];
  totalCount: number;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;
  @ViewChild('addNewUserModal', {static: false}) addNewUserModal: AddNewUserModalComponent;


  constructor(injector: Injector, private http: HttpClient) {
    super(injector);
    this.initFilters({
      districts: null,
      cities: null,
      schoolCategories: null,
      schoolProfiles: null,
      userRoles: null,
      userStatuses: null,
    });

    this.scrollHandle = this.scrollHandle.bind(this);
    this.requestDataFunc = this.requestData;
    this.initialBodyHeight = document.body.getBoundingClientRect().height;

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.schools = [];
      this.requestedPageCount = 1;
      this.activeUrlParams = urlParams;
      this.requestData(urlParams);
    });
  }


  requestData(urlParams?: Params): void {
    this.requestInProgress = !this.keepOldList;
    this.initialRequestInProgress = true;

    const httpParams = new RequestParams({...urlParams, page_size: 10}).getHttpParams();
    const path = 'school-units/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      response.results.map(result => this.schools.push(new SchoolUnit(result)));
      this.totalCount = response.count;
      this.elementCount = this.schools.length;
      this.initialRequestInProgress = false;
      this.keepOldList = false;
      this.requestInProgress = false;
    });
  }

  openDeActivateSchoolModalSchoolModal(school: SchoolUnit) {
    const modalData = {
      title: `Doriți să ${school.is_active ? 'dezactivați' : 'reactivați'} contul școlii ${school.name}?`,
      description: school.is_active ? 'Pentru această școală nu se vor mai putea introduce date în sistem și utilizatorii care aparțin școlii nu se vor mai putea autentifica în contul EduAlert.'
      : 'Pentru această școală se vor putea introduce din nou date în sistem și utilizatorii care aparțin școlii se vor putea autentifica în contul EduAlert.',
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        if (school.is_active) {
          this.deactivateSchool(school.id);
        } else {
          this.activateSchool(school.id);
        }
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  activateSchool(schoolId) {
    const path = `school-units/${schoolId}/activate/`;
    this.http.post(path, null).subscribe((response: any) => {
      this.schools[findIndex(this.schools, {id: schoolId})].is_active = response.is_active;
    });
  }

  deactivateSchool(schoolId) {
    const path = `school-units/${schoolId}/deactivate/`;
    this.http.post(path, null).subscribe((response: any) => {
      this.schools[findIndex(this.schools, {id: schoolId})].is_active = response.is_active;
    });

  }

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll',  this.scrollHandle);
  }

}
