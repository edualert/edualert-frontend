import {AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AcademicProfile} from '../../models/academic-program-details';
import {HttpClient} from '@angular/common/http';
import {ConfirmationModalComponent} from '../../shared/confirmation-modal/confirmation-modal.component';
import {Params} from '@angular/router';
import {ListPage} from '../list-page/list-page';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {getCurrentAcademicYear} from '../../shared/utils';
import {IdText} from '../../models/id-text';
import BaseRequestParameters from '../list-page/base-request-parameters';


class RequestParams extends BaseRequestParameters {
  readonly page_size: number;
  readonly page: number;

  constructor(newObj: { page_size?, page? }) {
    super();
    this.page_size = newObj?.page_size;
    this.page = newObj?.page;
  }
}


@Component({
  selector: 'app-manage-class-profiles',
  templateUrl: './manage-class-profiles.component.html',
  styleUrls: ['./manage-class-profiles.component.scss', '../../shared/label-styles.scss'],
})


export class ManageClassProfilesComponent extends ListPage implements AfterViewInit, OnDestroy {
  requestInProgress: boolean;
  afterDelete: boolean = false;

  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;

  params: Params;
  schoolProfiles: AcademicProfile[] = [];
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});

  constructor(injector: Injector,
              private http: HttpClient) {
    super(injector);

    this.initFilters({
      academicYears: null
    });

    this.scrollHandle = this.scrollHandle.bind(this);
    this.requestDataFunc = this.requestData;
    this.initialBodyHeight = document.body.getBoundingClientRect().height;

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.schoolProfiles = [];
      this.requestedPageCount = 1;
      this.activeUrlParams = urlParams;
      this.requestData(urlParams);
    });
  }

  requestData(urlParams?: Params): void {
    const path = `years/${urlParams.academicYear || this.defaultAcademicYear.id}/academic-programs/`;
    this.requestInProgress = !this.keepOldList;
    this.initialRequestInProgress = true;

    let httpParams;
    if (this.afterDelete) {
      httpParams = new RequestParams({...urlParams}).getHttpParams();
    } else {
      httpParams = new RequestParams({...urlParams, page_size: 10}).getHttpParams();
    }

    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      response.results.map(elem => {
        this.schoolProfiles.push(new AcademicProfile(elem));
      });
      this.elementCount = this.schoolProfiles.length;
      this.totalCount = response.count;
      this.initialRequestInProgress = false;
      this.requestInProgress = false;
      this.keepOldList = false;
      this.afterDelete = false;
    });
  }

  deleteSchoolProfile(profile: AcademicProfile, event?: any) {
    event.stopPropagation();
    const modalData = {
      title: `Doriți să ștergeți profilul ${profile.name}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.http.delete(`academic-programs/${profile.id}/`).subscribe((resp: any) => {
          if (resp === null) {
            const index = this.schoolProfiles.findIndex(element => element.id === profile.id);
            this.schoolProfiles.splice(index, 1);
            this.totalCount -= 1;
            if (this.schoolProfiles.length < this.totalCount) {
              this.afterDelete = true;
              this.requestData({...this.activeUrlParams, page_size: 1, page: this.schoolProfiles.length + 1});
            }
          }
        });
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll',  this.scrollHandle);
  }
}
