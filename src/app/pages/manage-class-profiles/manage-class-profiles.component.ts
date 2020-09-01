import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {AcademicProfile} from '../../models/academic-program-details';
import {HttpClient} from '@angular/common/http';
import {ConfirmationModalComponent} from '../../shared/confirmation-modal/confirmation-modal.component';
import {Params} from '@angular/router';
import {ListPage} from '../list-page/list-page';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {getCurrentAcademicYear} from '../../shared/utils';
import {IdText} from '../../models/id-text';

@Component({
  selector: 'app-manage-class-profiles',
  templateUrl: './manage-class-profiles.component.html',
  styleUrls: ['./manage-class-profiles.component.scss', '../../shared/label-styles.scss'],
})
export class ManageClassProfilesComponent extends ListPage implements OnInit {
  requestInProgress: boolean;

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
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams.academicYear);
    });
  }

  requestData(academicYear: number) {
    const path = `years/${academicYear || this.defaultAcademicYear.id}/academic-programs/`;
    this.http.get(path).subscribe((response: NetworkingListResponse) => {
      this.schoolProfiles = response.results.map(elem => new AcademicProfile(elem));
    });
  }

  deleteSchoolProfile(profile: AcademicProfile) {
    const modalData = {
      title: `Doriți să ștergeți profilul ${profile.name}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.http.delete(`academic-programs/${profile.id}/`).subscribe((resp: any) => {
          const index = this.schoolProfiles.findIndex(element => element.id === profile.id);
          this.schoolProfiles.splice(index, 1);
        });
      }
    };
    this.appConfirmationModal.open(modalData);
  }
}
