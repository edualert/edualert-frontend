import {Component, Injector, ViewChild} from '@angular/core';
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

class RequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly district: string; // cluj
  readonly city: string; // cluj-napoca
  readonly categories: number; // 1
  readonly academic_profile: IdName;

  constructor(newObj: { search?, district?, city?, schoolCategory?, schoolProfile? }) {
    super();
    this.search = newObj?.search;
    this.district = capitalizeString(newObj?.district, ['-']);
    this.city = capitalizeString(newObj?.city, ['-']);
    this.categories = newObj?.schoolCategory;
    this.academic_profile = newObj?.schoolProfile;
  }
}

@Component({
  selector: 'app-manage-schools',
  templateUrl: './manage-schools.component.html',
  styleUrls: ['./manage-schools.component.scss']
})
export class ManageSchoolsComponent extends ListPage {
  schools: SchoolUnit[] = [];
  totalCount: number;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;


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

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams);
    });
  }


  requestData(urlParams?: Params): void {
    this.requestInProgress = true;
    const httpParams = new RequestParams(urlParams).getHttpParams();
    const path = 'school-units/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      this.totalCount = response.count;
      this.schools = response.results.map(result => new SchoolUnit(result));
      this.requestInProgress = false;
    });
  }

  openDeActivateSchoolModalSchoolModal(school: SchoolUnit) {
    const modalData = {
      title: `${school.is_active ? 'Dezactivați' : 'Activați'} ${school.name}?`,
      description: `Vor fi ${school.is_active ? 'dezactivate' : 'activate'} toate conturile utilizatorilor din unitate`,
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
}
