import {Component, Injector, ViewChild} from '@angular/core';
import {StudyClass} from '../../models/study-class';
import {ListPage} from '../list-page/list-page';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {getCurrentAcademicYear, academicYearStart} from '../../shared/utils';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {ConfirmationModalComponent} from '../../shared/confirmation-modal/confirmation-modal.component';
import * as moment from 'moment';
import {IdText} from '../../models/id-text';
import {findIndex} from 'lodash';
import {AddNewUserModalComponent} from '../manage-users/add-new-user-modal/add-new-user-modal.component';


@Component({
  selector: 'app-manage-classes',
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.scss', './classes-general-styles.scss']
})
export class ManageClassesComponent extends ListPage {
  classes?: { string?: StudyClass[] } = null;
  isEditable: boolean;
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;
  @ViewChild('addNewUserModal', {static: false}) addNewUserModal: AddNewUserModalComponent;

  constructor(injector: Injector, private http: HttpClient) {
    super(injector);

    this.initFilters({
      academicYears: null
    });

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      // TODO: To be uncommented after demo
      // this.isEditable = moment().isBefore(academicYearStart.clone().set('year', urlParams.academicYear || this.defaultAcademicYear.id));
      this.requestData(urlParams);
    });
  }

  keepOrder = a => a;

  deleteClass(studyClass: StudyClass, sectionId: string, event?: any): void {
    // TODO: To be uncommented after demo
    // if (studyClass.has_previous_catalog_data || !this.isEditable) {
    //   return;
    // }

    event.stopPropagation();
    const modalData = {
      title: 'Vă rugăm confirmați',
      description: `Doriți să ștergeți clasa ${studyClass.class_grade} ${studyClass.class_letter}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.http.delete(`study-classes/${studyClass.id}/`).subscribe(() => {
          this.removeFromView(sectionId, studyClass.id);
        });
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  private removeFromView(yearId: string, classId: number): void {
    const index = this.classes[yearId].findIndex(element => element.id === classId);
    this.classes[yearId].splice(index, 1);

    // if was the only class of that study year (aka IX, X etc.), delete the study year
    if (!this.classes[yearId].length) {
      delete this.classes[yearId];
    }

    // if was the only study year of the whole school, delete the object completely
    if (!Object.keys(this.classes).length) {
      this.classes = null;
    }
  }

  private requestData(urlParams: Params): void {
    this.requestInProgress = true;

    const path = `years/${urlParams.academicYear || this.defaultAcademicYear.id}/study-classes/`;
    this.http.get(path).subscribe((response: NetworkingListResponse) => {
      if (Object.keys(response).length) {
        this.classes = {};
        Object.keys(response).forEach(key => {
          this.classes[key] = response[key].map(element => new StudyClass(element));
        });
      } else {
        this.classes = null;
      }
      this.requestInProgress = false;
    });
  }
}
