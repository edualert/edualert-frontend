import {Component, OnInit, Injector} from '@angular/core';
import {AddEditSchoolsComponent} from '../add-edit-schools.component';
import {SchoolDetail} from '../../../../models/school-details';
import {CanComponentDeactivate} from '../../../../services/can-leave-guard.service';

@Component({
  selector: 'app-add-school-details',
  templateUrl: './add-school-details.component.html',
  styleUrls: ['./add-school-details.component.scss', '../shared-add-edit-styles.scss', '../../../../shared/label-styles.scss']
})
export class AddSchoolDetailsComponent extends AddEditSchoolsComponent implements OnInit, CanComponentDeactivate {

  isCancel: boolean;
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.schoolDetails = new SchoolDetail({});
    this.isCancel = false;
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
        district: 'Cluj',
        city: 'Cluj-Napoca',
        name: this.schoolDetails.name,
        categories: []
      };
      for (const category of this.schoolDetails.categories) {
        requestData.categories.push(category.id);
      }

      this.httpClient.post('school-units/', requestData).subscribe(response => {
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
      return confirm('Doriți să continuați? Datele introduse vor fi pierdute.');
    }
    return true;
  }

}
