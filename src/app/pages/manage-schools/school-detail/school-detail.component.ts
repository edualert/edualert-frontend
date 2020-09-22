import {Component, OnInit, ViewChild} from '@angular/core';
import {SchoolDetail} from '../../../models/school-details';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';
import {ConfirmationModalComponent} from '../../../shared/confirmation-modal/confirmation-modal.component';
import {ViewUserModalComponent} from '../../manage-users/view-user-modal/view-user-modal.component';

@Component({
  selector: 'app-school-detail',
  templateUrl: './school-detail.component.html',
  styleUrls: ['./school-detail.component.scss', '../../../shared/label-styles.scss']
})
export class SchoolDetailComponent implements OnInit {
  private readonly path = 'school-units/';
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;
  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  school: SchoolDetail;
  schoolId: Params;

  constructor(private httpClient: HttpClient,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.schoolId = this.activatedRoute.snapshot.params['id'];
    this.httpClient.get<SchoolDetail>(this.path + this.schoolId + '/').subscribe( response => {
      this.school = response;
    });
  }

  openDeActivateSchoolModalSchoolModal(school: SchoolDetail) {
    const modalData = {
      title: `Doriți să ${school.is_active ? 'dezactivați' : 'reactivați'} contul școlii ${school.name}?`,
      description: `Pentru această școală ${ school.is_active ? 'nu se vor mai putea' :  'se vor putea'} introduce date în sistem și utilizatorii care aparțin școlii ${ school.is_active ? 'nu se vor mai putea' :  'se vor putea'} autentifica în contul EduAlert.`,
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
    this.httpClient.post(path, null).subscribe((response: any) => {
      this.school.is_active = response.is_active;
    });
  }

  deactivateSchool(schoolId) {
    const path = `school-units/${schoolId}/deactivate/`;
    this.httpClient.post(path, null).subscribe((response: any) => {
      this.school.is_active = response.is_active;
    });

  }

  openUserModal(event, id) {
    this.appViewUserModal.open(id);
  }
}
