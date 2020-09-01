import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {StudyClass} from '../../../models/study-class';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {NetworkingListResponse} from '../../../models/networking-list-response';
import {ConfirmationModalComponent} from '../../../shared/confirmation-modal/confirmation-modal.component';
import {ViewUserModalComponent} from '../../manage-users/view-user-modal/view-user-modal.component';

@Component({
  selector: 'app-class-detail',
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss']
})
export class ClassDetailComponent {
  private _path = null;

  study_class?: StudyClass = new StudyClass({});
  isEditable: boolean;
  requestInProgress = false;
  tabs = [
    {name: "Profesorii clasei", id: "teachers_class_through"},
    {name: "Elevii clasei", id: "students"},
  ];
  activeTab;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;
  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  constructor(private route: ActivatedRoute, private httpClient: HttpClient, private router: Router) {
    this._path = `study-classes/${route.snapshot.params['id']}/`;
    this.activeTab = this.tabs[0].id;
    this.requestData();
  }

  deleteClass = (event) => {
    event.stopPropagation();

    if (this.study_class.has_previous_catalog_data) {
      return;
    }

    const modalData = {
      title: "Vă rugam confirmați",
      description: `Doriți să ștergeți clasa ${this.study_class.class_grade} ${this.study_class.class_letter} ?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.httpClient.delete(this._path).subscribe((response: any) => {
           this.router.navigateByUrl('/manage-classes');
        });
      }
    }
    this.appConfirmationModal.open(modalData);
  }

  requestData(): void {
    this.requestInProgress = true;
    
    this.httpClient.get(this._path).subscribe((response: NetworkingListResponse) => {
      if (Object.keys(response).length) {
        this.study_class = new StudyClass(response);

        // TODO: Uncomment this after demo
        // this.isEditable = moment().isBefore(academicYearStart.clone().set("year", this.study_class.academic_year));
        this.isEditable = true;
        //  END TODO
      }
      this.requestInProgress = false;
    });
  }

  tabClicked(tabClicked: string) {
    this.activeTab = tabClicked;
  }

  openUserModal(event, id) {
    this.appViewUserModal.open(id);
  }
}
