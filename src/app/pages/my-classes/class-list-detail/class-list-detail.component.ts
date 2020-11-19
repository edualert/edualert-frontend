import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Params} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ClassDetails, Subject} from '../../../models/class-details';
import {AddGradesBulkModalComponent} from '../../../catalog/modals/add-grades-bulk-modal/add-grades-bulk-modal.component';
import {AddAbsencesBulkModalComponent} from '../../../catalog/modals/add-absences-bulk-modal/add-absences-bulk-modal.component';
import {SettingsModalComponent} from '../../../catalog/settings-modal/settings-modal.component';
import {findIndex} from 'lodash';
import {IdName} from '../../../models/id-name';
import {forkJoin, Observable} from 'rxjs';
import * as moment from 'moment';
import {cloneDeep} from 'lodash';
import {ListPage} from '../../list-page/list-page';
import {IdText} from '../../../models/id-text';
import BaseRequestParameters from '../../list-page/base-request-parameters';
import {ViewUserModalComponent} from '../../manage-users/view-user-modal/view-user-modal.component';

class RequestParams extends BaseRequestParameters {
  readonly ordering: string;

  constructor(newObj?: any) {
    super();
    this.ordering = newObj?.ordering;
  }
}

class TableTab extends IdName {
  tableLayout: 'class_master' | 'class_students' | string;

  constructor(obj?) {
    super(obj);
    this.tableLayout = obj?.tableLayout;
  }
}

@Component({
  selector: 'app-class-list-detail',
  templateUrl: './class-list-detail.component.html',
  styleUrls: ['./class-list-detail.component.scss']
})
export class ClassListDetailComponent extends ListPage implements OnInit {
  private classId: string;

  classDetails: ClassDetails;
  ownPupilsData: any[];
  subjectsDataList: { [key: number]: { studentListData: any, subjectId: number } } = {};

  tabs: TableTab[];
  activeTab: any;
  tableData: any;
  tabsInitialised: boolean = false;
  initialSortCriteria: any = null;
  pupilCount: number;

  @ViewChild('addGradesBulkModal', {static: false}) addGradesBulkModal: AddGradesBulkModalComponent;
  @ViewChild('addAbsencesBulkModal', {static: false}) addAbsencesBulkModal: AddAbsencesBulkModalComponent;
  @ViewChild('settingsModal', {static: false}) settingsModal: SettingsModalComponent;
  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  readonly defaultSortingCriterion: IdText = new IdText({id: 'student_name', text: 'Nume'});
  urlParams = {'ordering': this.defaultSortingCriterion?.id};

  // The Own Pupils tab (only for class master) will always have id 0
  readonly classPupilsTab: string | number = 0;
  classMasterTab: string | number = -1;

  constructor(injector: Injector,
              private httpClient: HttpClient) {
    super(injector);
    this.sendClassMessageList = this.sendClassMessageList.bind(this);

    this.initFilters({
      sortCriteria: null
    });

    this.customUrlParamsChange({'ordering': this.defaultSortingCriterion?.id});

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      if (Object.keys(urlParams).length === 0) {
        urlParams = {'ordering': this.defaultSortingCriterion?.id};
        this.customUrlParamsChange(urlParams);
      }
      this.activeUrlParams = urlParams;
      this.fetchClassData(urlParams);
    });
  }

  ngOnInit(): void {
    this.classId = this.activatedRoute.snapshot.params['id'];
    this.tabs = [];
    if (this.initialSortCriteria === null) {
      this.initialSortCriteria = this.filterData.sortCriteria;
    }
    this.fetchClassData(this.urlParams);
  }

  refreshClassData = () => {
    this.fetchCatalogData(this.activeTab.id, this.urlParams);
  }

  private fetchClassData(urlParams?): void {

    // Get the overall class details
    this.httpClient.get(`own-study-classes/${this.classId}/`).subscribe((response: ClassDetails) => {

      this.classDetails = new ClassDetails(response);
      if (this.classDetails.is_class_master) {
        const gradesCountIndex = findIndex(this.filterData.sortCriteria, ({id: 'grades_count', text: 'Număr note'}));
        const lastGradeDateIndex = findIndex(this.filterData.sortCriteria, ({id: 'last_grade_date', text: 'Data ultimei note'}));
        if (gradesCountIndex !== -1 && lastGradeDateIndex !== 1) {
          this.filterData.sortCriteria.splice(findIndex(this.filterData.sortCriteria, ({id: 'grades_count', text: 'Număr note'})), 1);
          this.filterData.sortCriteria.splice(findIndex(this.filterData.sortCriteria, ({id: 'last_grade_date', text: 'Data ultimei note'})), 1);
        }
      } else if (this.filterData.sortCriteria.length === 3) {
        this.filterData.sortCriteria.push(...[{id: 'grades_count', text: 'Număr note'}, {id: 'last_grade_date', text: 'Data ultimei note'}]);
      }

      if (!this.tabsInitialised) {
        this.initialiseTabs();
      }

      if (this.classDetails.is_class_master) {
        this.fetchOwnPupilData(urlParams);
      } else {
        this.fetchCatalogData(this.classDetails.taught_subjects[0].id, urlParams);
      }
    });
  }

  private initialiseTabs(): void {
    this.tabs = [];

    if (this.classDetails.is_class_master) {
      this.tabs.push(new TableTab({name: 'Elevii Clasei', id: this.classPupilsTab, tableLayout: 'class_students'}));
    }
    this.tabs = this.tabs.concat(
      this.classDetails.taught_subjects.map((subject: Subject) => {
        if (subject.is_coordination) {
          this.classMasterTab = subject.id;
        }
        const tableLayout = subject.is_coordination ? 'class_master' : '';
        this.tabsInitialised = true;
        return new TableTab({id: subject.id, name: subject.name, tableLayout});
      })
    );
    this.activeTab = this.tabs[0];
  }

  private fetchOwnPupilData(urlParams?: Params) {
    const httpParams = new RequestParams({...urlParams}).getHttpParams();
    const dataPath = 'own-study-classes/' + this.classId + '/pupils/';
    this.httpClient.get(dataPath, {params: httpParams}).subscribe((response: any[]) => {
      this.ownPupilsData = response;
    });
  }

  private fetchCatalogData(subjectId: any, urlParams?: Params): void {
    const httpParams = new RequestParams({...urlParams}).getHttpParams();

    this.httpClient.get(`own-study-classes/${this.classId}/subjects/${subjectId}/catalogs/`, {params: httpParams}).subscribe((response: any[]) => {
      this.subjectsDataList[subjectId] = {studentListData: response, subjectId};
      this.tableData = response;
      this.pupilCount = response.length;
    });
  }

  changeTab(tab: any) {
    this.activeTab = this.tabs[findIndex(this.tabs, {id: parseInt(tab, 10)})];

    if (parseInt(tab, 10) === this.classPupilsTab && this.classDetails?.is_class_master) {
      this.tableData = this.ownPupilsData;
    } else {
      this.setDataForTab(tab);
    }
    this.pupilCount = this.tableData?.length;
  }

  private setDataForTab(id) {
    // If we already have the data, set it.
    if (this.subjectsDataList[id]) {
      this.tableData = this.subjectsDataList[id].studentListData;
      this.pupilCount = this.tableData.length;
    } else {
      // Else, fetch it from the server and set it;
      this.fetchCatalogData(id, this.activeUrlParams);
    }
  }

  provideButtonsList() {
    if (this.classDetails?.is_class_master && this.classPupilsTab === this.activeTab.id) {
      return [{
        text: 'Trimite mesaj clasă',
        buttonCallbackFn: this.sendClassMessageList.bind(this)
      },
        {
          text: 'Exportă catalog',
          buttonCallbackFn: this.catalogExport.bind(this)
        }
      ];
    } else if (this.classDetails?.is_class_master && this.classMasterTab === this.activeTab.id) {
      return [{
        text: 'Trimite mesaj clasă',
        buttonCallbackFn: this.sendClassMessageList.bind(this)
      },
        {
          text: 'Adaugă absențe',
          buttonCallbackFn: this.openAddBulkAbsencesModal.bind(this)
        },
        {
          text: 'Exportă catalog',
          buttonCallbackFn: this.catalogExport.bind(this)
        }
      ];
    }
    return [{
      text: 'Trimite mesaj clasă',
      buttonCallbackFn: this.sendClassMessageList.bind(this)
    },
      {
        text: 'Adaugă note',
        buttonCallbackFn: this.openAddBulkGradesModal.bind(this)
      }
      ,
      {
        text: 'Adaugă absențe',
        buttonCallbackFn: this.openAddBulkAbsencesModal.bind(this)
      }
      ,
      {
        text: 'Setări',
        buttonCallbackFn: this.openSettingsModal.bind(this)
      }
      ,
      {
        text: 'Exportă catalog',
        buttonCallbackFn: this.catalogExport.bind(this)
      }
    ];
  }

  sendClassMessageList() {
    this.router.navigateByUrl(`/messages/create?classId=${this.classId}&className=${this.classDetails?.class_grade} ${this.classDetails?.class_letter}`);
  }

  catalogExport() {
    console.log('Exportă catalog');
  }

  openAddBulkGradesModal() {
    const baseUrl = `own-study-classes/${this.classDetails?.id.toString()}/subjects/${this.activeTab.id.toString()}`;
    const modalData = {
      classGrade: this.classDetails?.class_grade,
      classLetter: this.classDetails?.class_letter,
      students: this.tableData,
      saveGradesCallback: (addedGrades: BulkAddedGrades) => {
        if (addedGrades.student_grades.length > 0) {
          this.httpClient.post(`${baseUrl}/bulk-grades/`, addedGrades).subscribe((response) => {
            if (Object.keys(response).length) {
              this.tableData = response['catalogs'];
              this.addGradesBulkModal.close();
            }
          });
        } else {
          this.addGradesBulkModal.close();
        }
      }
    };

    this.addGradesBulkModal.open(modalData);
  }

  openAddBulkAbsencesModal() {
    const baseUrl = `own-study-classes/${this.classDetails?.id.toString()}/subjects/${this.activeTab.id.toString()}`;
    const modalData = {
      classGrade: this.classDetails?.class_grade,
      classLetter: this.classDetails?.class_letter,
      students: this.tableData,
      saveAbsencesCallback: (addedAbsences: BulkAddedAbsences) => {
        if (addedAbsences.student_absences.length > 0) {
          this.httpClient.post(`${baseUrl}/bulk-absences/`, addedAbsences).subscribe((response) => {
            if (Object.keys(response).length) {
              this.tableData = response['catalogs'];
              this.addAbsencesBulkModal.close();
            }
          });
        } else {
          this.addAbsencesBulkModal.close();
        }
      }
    };

    this.addAbsencesBulkModal.open(modalData);
  }

  openSettingsModal() {
    this.settingsModal.open(this.activeTab.id, this.classDetails);
  }

  private modifyCatalog(request: Observable<any>, changesCatalogContent?: boolean): void {

    // Remember the tab and its associated data before the request.
    const tabBeforeRequest = this.activeTab.id;
    const currentSubject = this.subjectsDataList[tabBeforeRequest];

    request.subscribe((response: any) => {
      const studentIndex = findIndex(currentSubject.studentListData, {id: response.id});
      if (studentIndex >= 0) {
        currentSubject.studentListData[studentIndex] = response;
      }

      // Do not update TableData if tab has been changed while the request was being made.
      if (this.activeTab.id === tabBeforeRequest) {
        this.tableData = cloneDeep(this.subjectsDataList[tabBeforeRequest].studentListData);
      }

      // Invalidate "Elevii Clasei" content due to the addition/removal of grades/absences, so we have to request the data for that tab again
      if (changesCatalogContent) {
        if (this.classDetails.is_class_master) {
          this.fetchOwnPupilData();
          this.fetchCatalogData(tabBeforeRequest);
        } else {
          this.fetchCatalogData(tabBeforeRequest);
        }
      }
    });
  }

  saveSingleGrade(value: { grade: { selectedGrade: number, selectedDate: Date, id: number, isThesis?: boolean }, id: number, semester: string }) {
    let request;
    if (value.grade.id) {
      request = this.httpClient.put(
        `grades/${value.grade.id}/`,
        {
          grade: value.grade.selectedGrade,
          taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
          grade_type: value.grade.isThesis ? 'THESIS' : 'REGULAR'
        }
      );
    } else {
      request = this.httpClient.post(
        `catalogs/${value.id}/grades/`,
        {
          grade: value.grade.selectedGrade,
          taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
          grade_type: value.grade.isThesis ? 'THESIS' : 'REGULAR'
        }
      );
    }
    this.modifyCatalog(request, true);
  }

  addSingleAbsence(value: { absence: { date: Date, isFounded: boolean }, id: number, semester: string }): void {
    const request = this.httpClient.post(
      `catalogs/${value.id}/absences/`,
      {
        taken_at: moment(value.absence.date).format('DD-MM-YYYY'),
        is_founded: value.absence.isFounded
      }
    );
    this.modifyCatalog(request, true);
  }

  deleteGrade(grade: any): void {
    const request = this.httpClient.delete(`grades/${grade.id}/`);
    this.modifyCatalog(request, true);
  }

  deleteAbsence(absence: any): void {
    const request = this.httpClient.delete(`absences/${absence.id}/`);
    this.modifyCatalog(request, true);
  }

  authorizeAbsence(absence: any): void {
    const request = this.httpClient.post(`absences/${absence.id}/authorize/`, {});
    this.modifyCatalog(request, true);
  }

  onLinkClick(event: { cellIdentifier: string, dataRow: any }): void {
    switch (event.cellIdentifier) {
      case 'student_all_subjects': {
        this.router.navigateByUrl(`/my-classes/${this.classId}/students/${event.dataRow.student.id}/catalog`);
      }
    }
  }

  openUserModal(event, id) {
    event.stopPropagation();
    this.appViewUserModal.open(id);
  }

}

class BulkAddedGrades {
  taken_at: string;
  student_grades: StudentToGrade[];
}

class StudentToGrade {
  student: string | number;
  grade: number;
}

class BulkAddedAbsences {
  taken_at: string;
  student_absences: StudentToAbsence[];
}

class StudentToAbsence {
  student: string | number;
  is_founded: boolean;

}
