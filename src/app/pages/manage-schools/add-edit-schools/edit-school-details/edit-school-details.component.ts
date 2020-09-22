import {Component, Injector, OnInit} from '@angular/core';
import {AddEditSchoolsComponent} from '../add-edit-schools.component';
import {findIndex} from 'lodash';
import {SchoolDetail} from '../../../../models/school-details';
import {CanComponentDeactivate} from '../../../../services/can-leave-guard.service';

@Component({
  selector: 'app-edit-school-details',
  templateUrl: './edit-school-details.component.html',
  styleUrls: ['./edit-school-details.component.scss', '../shared-add-edit-styles.scss', '../../../../shared/label-styles.scss']
})
export class EditSchoolDetailsComponent extends AddEditSchoolsComponent implements OnInit, CanComponentDeactivate {

  isCancel: boolean;
  constructor(injector: Injector) {
    super(injector);
  }


  ngOnInit(): void {
    this.isCancel = false;
    this.schoolId = this.activatedRoute.snapshot.params['id'];
    this.httpClient.get<SchoolDetail>('school-units/' + this.schoolId + '/').subscribe(response => {
      this.schoolDetails = response;
      if (this.schoolDetails.categories.length > 0) {
        let requestPath = 'school-units-profiles/?';
        for (const category of this.schoolDetails.categories) {
          requestPath = requestPath + 'category=' + category.id + '&';
        }
        requestPath = requestPath.slice(0, -1);
        this.schoolProfilesService.getData(true, requestPath).subscribe((resp) => {
          if (resp.length > 0) {
            this.data.academic_profiles = resp;
          } else {
            this.data.academic_profiles = [];
            this.schoolDetails.academic_profile = null;
          }
        });
      }
    });
  }

  onSubmit() {
    this.checkObject(this.schoolDetails, this.schoolDetailsError);
    if (!this.hasUnfilledFields) {
      const requestData = {
        academic_profile: this.schoolDetails.academic_profile ? this.schoolDetails.academic_profile.id : null,
        address: this.schoolDetails.address,
        phone_number: this.schoolDetails.phone_number,
        email: this.schoolDetails.email,
        school_principal: this.schoolDetails.school_principal.id,
        district: this.schoolDetails.district,
        city: this.schoolDetails.city,
        name: this.schoolDetails.name,
        categories: []
      };
      for (const category of this.schoolDetails.categories) {
        requestData.categories.push(category.id);
      }

      this.httpClient.put('school-units/' + this.schoolId + '/', requestData).subscribe(
        response => {
          if (response) {
            this.hasUnsavedData = false;
            this.router.navigate(['manage-schools/']);
          }
        },
        error => {
          this.schoolDetailsError[Object.keys(error['error'])[0]] = error['error'][Object.keys(error['error'])[0]];
        }
      );
    }
  }

  onCancel() {
    this.isCancel = true;
  }

  canDeactivate(): boolean {
    if (this.hasModifiedData && (this.hasUnsavedData || this.hasUnfilledFields)) {
      if (confirm('Doriti sa continuati? Datele introduse vor fi pierdute.')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

}
