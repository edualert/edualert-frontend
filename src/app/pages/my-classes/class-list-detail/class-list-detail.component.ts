import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClassDetails, Subject } from '../../../models/class-details';
import { AddGradesBulkModalComponent } from '../../../catalog/modals/add-grades-bulk-modal/add-grades-bulk-modal.component';
import { AddAbsencesBulkModalComponent } from '../../../catalog/modals/add-absences-bulk-modal/add-absences-bulk-modal.component';
import { SettingsModalComponent } from '../../../catalog/settings-modal/settings-modal.component';
import { findIndex } from 'lodash';
import { IdName } from '../../../models/id-name';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { cloneDeep } from 'lodash';
import { ListPage } from '../../list-page/list-page';
import { IdText } from '../../../models/id-text';
import BaseRequestParameters from '../../list-page/base-request-parameters';
import { ViewUserModalComponent } from '../../manage-users/view-user-modal/view-user-modal.component';
import { AcademicYearCalendarService } from '../../../services/academic-year-calendar.service';
import { AcademicYearCalendar } from '../../../models/academic-year-calendar';
import { setScrollableContainerHeight } from '../../../shared/utils';
import { CatalogDataService } from '../../../services/catalog-data.service';

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
export class ClassListDetailComponent extends ListPage implements OnInit, OnDestroy {
  private classId: string;

  classDetails: ClassDetails;
  subjectsDataList: { [key: number]: { studentListData: any, subjectId: number, sortedBy?: string } } = {};
  currentYear: string = moment().format('YYYY');
  isClassFromCurrentAcademicYear: boolean = true;

  tabs: TableTab[];
  activeTab: any;
  tableData: any;
  tabsInitialised: boolean = false;
  modifiedPupilData: boolean = false;
  modifiedTabsIds: number[] = [];
  initialSortCriteria: any = null;
  readonly defaultSortingCriterion: IdText = new IdText({id: 'student_name', text: 'Nume'});

  // The Own Pupils tab (only for class master) will always have id 0
  readonly classPupilsTabId: string | number = 0;
  classMasterTab: string | number = -1;

  pupilCount: number;
  academicYearCalendar: AcademicYearCalendar;

  loading: boolean;
  isDetailsSectionOpen: boolean = false;

  displayErrorToast: boolean = false;
  toastErrorMessage: string;

  isSecondSemesterEnded: boolean;

  @ViewChild('addGradesBulkModal', {static: false}) addGradesBulkModal: AddGradesBulkModalComponent;
  @ViewChild('addAbsencesBulkModal', {static: false}) addAbsencesBulkModal: AddAbsencesBulkModalComponent;
  @ViewChild('settingsModal', {static: false}) settingsModal: SettingsModalComponent;

  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  @ViewChild('scrollContainer', {static: false}) scrollContainerRef: ElementRef;

  constructor(injector: Injector,
              private httpClient: HttpClient,
              private elementRef: ElementRef,
              private academicYearCalendarService: AcademicYearCalendarService,
              private catalogDataService: CatalogDataService) {
    super(injector);
    this.sendClassMessageList = this.sendClassMessageList.bind(this);

    this.initFilters({
      sortCriteria: null
    });

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      if (Object.keys(urlParams).length === 0) {
        urlParams = {'ordering': this.defaultSortingCriterion?.id};
        this.customUrlParamsChange(urlParams);
      }
      this.activeUrlParams = urlParams;
      if (this.classId) {
        this.fetchClassData(urlParams);
      }
    });

    this.academicYearCalendarService.getData(false).subscribe(response => {
      this.academicYearCalendar = response;
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();
      this.isSecondSemesterEnded = now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf();
    });

    this.classId = this.activatedRoute.snapshot.params['id'];
    this.httpClient.get(`own-study-classes/${this.classId}/`).subscribe((response: ClassDetails) => {
      this.isClassFromCurrentAcademicYear = response.academic_year.toString() === this.currentYear;
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.tabs = [];
    if (this.initialSortCriteria === null) {
      this.initialSortCriteria = this.filterData.sortCriteria;
    }
    this.fetchClassData(this.activeUrlParams);
  }

  ngOnDestroy(): void {
    document.body.removeAttribute('style');
  }

  refreshClassData = () => {
    this.fetchCatalogData(this.activeTab.id, this.activeUrlParams);
  };

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

      if (this.classDetails.is_class_master && this.activeTab.tableLayout === 'class_students') {
        this.fetchOwnPupilData(urlParams);
      } else {
        if (this.activeTab) {
          this.fetchCatalogData(this.activeTab.id, urlParams);
        } else {
          this.fetchCatalogData(this.classDetails.taught_subjects[0].id, urlParams);
        }
      }
    }, error => {
      if (error.status === 404) {
        this.router.navigateByUrl('').then();
      }
    });
  }

  private initialiseTabs(): void {
    this.tabs = [];

    if (this.classDetails.is_class_master) {
      this.tabs.push(new TableTab({name: 'Elevii Clasei', id: this.classPupilsTabId, tableLayout: 'class_students'}));
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
    this.tableData = null;
    this.httpClient.get(dataPath, {params: httpParams}).subscribe((response: any[]) => {
      setScrollableContainerHeight();
      this.tableData = response;
      this.pupilCount = response.length;
      this.subjectsDataList[0] = {studentListData: response, subjectId: 0, sortedBy: this.activeUrlParams.ordering};
      setTimeout(() => this.loading = false, 400);
    });
  }

  private fetchCatalogData(subjectId: any, urlParams?: Params): void {
    this.isDetailsSectionOpen = false;
    const httpParams = new RequestParams({...urlParams}).getHttpParams();
    if (subjectId !== this.activeTab.id) {
      this.tableData = null;
    }

    this.httpClient.get(`own-study-classes/${this.classId}/subjects/${subjectId}/catalogs/`, {params: httpParams}).subscribe((response: any[]) => {
      setScrollableContainerHeight();
      this.tableData = response;
      this.pupilCount = response.length;
      this.subjectsDataList[subjectId] = {studentListData: response, subjectId, sortedBy: this.activeUrlParams.ordering};
      setTimeout(() => this.loading = false, 400);
    });
  }

  changeTab(tab: any) {
    this.isDetailsSectionOpen = false;
    if (this.activeTab.id.toString() === tab || this.loading) {
      return;
    }
    this.loading = true;
    this.activeTab = this.tabs[findIndex(this.tabs, {id: parseInt(tab, 10)})];

    this.setDataForTab(tab);
    this.pupilCount = this.tableData?.length;
  }

  private setDataForTab(id, newRequest?: boolean) {
    // If we already have the data, set it.
    if (this.subjectsDataList[id] && this.activeUrlParams.ordering === this.subjectsDataList[id].sortedBy
      && !(this.modifiedPupilData && ['class_students', 'class_master'].includes(this.activeTab.tableLayout)) && !newRequest) {
      // If we have the data but it was updated, fetch it from the server, else set it.
      if (this.modifiedTabsIds.includes(this.activeTab.id)) {
        this.fetchCatalogData(id, this.activeUrlParams);
        this.modifiedTabsIds.splice(this.modifiedTabsIds.indexOf(this.activeTab.id), 1);
      } else {
        this.tableData = this.subjectsDataList[id].studentListData;
        this.pupilCount = this.tableData.length;
        setScrollableContainerHeight();
        this.loading = false;
      }
    } else {
      // Else, fetch it from the server and set it.
      if (['class_students', 'class_master'].includes(this.activeTab.tableLayout)) {
        this.fetchOwnPupilData(this.activeUrlParams);
        if (this.modifiedPupilData) {
          this.modifiedPupilData = false;
        }
      } else {
        this.fetchCatalogData(id, this.activeUrlParams);
      }
    }
  }

  provideButtonsList() {
    if (this.classDetails?.is_class_master && this.classPupilsTabId === this.activeTab.id) {
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
          buttonCallbackFn: this.openAddBulkAbsencesModal.bind(this),
          disabled: this.isSecondSemesterEnded || !this.isClassFromCurrentAcademicYear
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
        buttonCallbackFn: this.openAddBulkGradesModal.bind(this),
        disabled: this.isSecondSemesterEnded || !this.isClassFromCurrentAcademicYear
      }
      ,
      {
        text: 'Adaugă absențe',
        buttonCallbackFn: this.openAddBulkAbsencesModal.bind(this),
        disabled: this.isSecondSemesterEnded || !this.isClassFromCurrentAcademicYear
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
    const subjectId = this.activeTab.id;
    const baseUrl = `own-study-classes/${this.classDetails?.id.toString()}/subjects/${subjectId.toString()}`;
    const modalData = {
      classGrade: this.classDetails?.class_grade,
      classLetter: this.classDetails?.class_letter,
      students: this.activeUrlParams?.ordering !== this.defaultSortingCriterion.id ?
        this.tableData.sort((a, b) => a.student.full_name.localeCompare(b.student.full_name)) : this.tableData,
      saveGradesCallback: (addedGrades: BulkAddedGrades) => {
        if (addedGrades.student_grades.length > 0) {
          this.httpClient.post(`${baseUrl}/bulk-grades/`, addedGrades).subscribe((response) => {
            if (Object.keys(response).length) {
              if (this.activeUrlParams?.ordering !== this.defaultSortingCriterion.id) {
                this.setDataForTab(subjectId, true);
              } else {
                this.tableData = response['catalogs'];
                this.subjectsDataList[subjectId] = {studentListData: response['catalogs'], subjectId};
              }
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
    const subjectId = this.activeTab.id;
    const baseUrl = `own-study-classes/${this.classDetails?.id.toString()}/subjects/${subjectId.toString()}`;
    const modalData = {
      classGrade: this.classDetails?.class_grade,
      classLetter: this.classDetails?.class_letter,
      students: this.activeUrlParams?.ordering !== this.defaultSortingCriterion.id ?
        this.tableData.sort((a, b) => a.student.full_name.localeCompare(b.student.full_name)) : this.tableData,
      saveAbsencesCallback: (addedAbsences: BulkAddedAbsences) => {
        if (addedAbsences.student_absences.length > 0) {
          this.httpClient.post(`${baseUrl}/bulk-absences/`, addedAbsences).subscribe((response) => {
            if (Object.keys(response).length) {
              if (this.activeUrlParams?.ordering !== this.defaultSortingCriterion.id) {
                this.setDataForTab(subjectId, true);
              } else {
                this.tableData = response['catalogs'];
                this.subjectsDataList[subjectId] = {studentListData: response['catalogs'], subjectId};
              }
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

  private modifyCatalog(request: Observable<any>): void {

    // Remember the tab and its associated data before the request.
    const tabBeforeRequest = this.activeTab.id;
    const currentSubject = this.subjectsDataList[tabBeforeRequest];

    request.subscribe((response: any) => {
      const studentIndex = findIndex(currentSubject.studentListData, {id: response.id});
      if (studentIndex >= 0) {
        currentSubject.studentListData[studentIndex] = response;
      }
      this.catalogDataService.dataChanged(this.tableData);

      // Do not update TableData if tab has been changed while the request was being made.
      if (this.activeTab.id === tabBeforeRequest) {
        this.tableData = cloneDeep(this.subjectsDataList[tabBeforeRequest].studentListData);
      }

      if (this.classDetails.is_class_master) {
        this.modifiedPupilData = true;
      }
    }, (error) => {
      this.displayErrorToast = true;
      this.toastErrorMessage = error.error[Object.keys(error.error)[0]];
    });
  }

  saveSingleGrade(value: {
    grade:
      {
        selectedGrade: number,
        selectedDate: Date,
        id: number,
        isThesis?: boolean,
        isExaminationSection?: boolean,
        gradeType?: string,
        examinationType?: string,
        selectedGrade2?: number,
        semester?: number
      },
    id: number,
    semester: string
  }) {
    let request;
    if (value.grade.id && !value.grade.isExaminationSection) {
      request = this.httpClient.put(
        `grades/${value.grade.id}/`,
        {
          grade: value.grade.selectedGrade,
          taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
          grade_type: value.grade.isThesis ? 'THESIS' : 'REGULAR'
        }
      );
    } else if (value.grade.isExaminationSection) {
      if (value.grade.id) {
        request = this.httpClient.put(
          `examination-grades/${value.grade.id}/`,
          {
            grade1: value.grade.selectedGrade,
            grade2: value.grade.selectedGrade2,
            taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
            examination_type: value.grade.examinationType,
            grade_type: value.grade.gradeType,
            semester: value.grade.semester
          }
        );
      } else {
        let body;
        if (value.grade.gradeType === 'DIFFERENCE') {
          body = {
            grade1: value.grade.selectedGrade,
            grade2: value.grade.selectedGrade2,
            taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
            examination_type: value.grade.examinationType,
            grade_type: value.grade.gradeType,
            semester: value.grade.semester
          };
        } else {
          body = {
            grade1: value.grade.selectedGrade,
            grade2: value.grade.selectedGrade2,
            taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
            examination_type: value.grade.examinationType,
            grade_type: value.grade.gradeType
          };
        }
        request = this.httpClient.post(
          `catalogs/${value.id}/examination-grades/`,
          body
        );
      }
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
    this.modifiedTabsIds.push(this.activeTab.id);
    this.modifyCatalog(request);
  }

  addSingleAbsence(value: { absence: { date: Date, isFounded: boolean }, id: number, semester: string }): void {
    const request = this.httpClient.post(
      `catalogs/${value.id}/absences/`,
      {
        taken_at: moment(value.absence.date).format('DD-MM-YYYY'),
        is_founded: value.absence.isFounded
      }
    );
    this.modifiedTabsIds.push(this.activeTab.id);
    this.modifyCatalog(request);
  }

  deleteGrade(grade: any): void {
    let url: string;
    if (grade?.grade1) {
      url = `examination-grades/${grade.id}/`;
    } else {
      url = `grades/${grade.id}/`;
    }
    const request = this.httpClient.delete(url);
    this.modifyCatalog(request);
  }

  deleteAbsence(absence: any): void {
    const request = this.httpClient.delete(`absences/${absence.id}/`);
    this.modifyCatalog(request);
  }

  authorizeAbsence(absence: any): void {
    const request = this.httpClient.post(`absences/${absence.id}/authorize/`, {});
    this.modifyCatalog(request);
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

  toggleDetailsSection(): void {
    this.isDetailsSectionOpen = !this.isDetailsSectionOpen;
    setScrollableContainerHeight(true);
  }

  hideErrorToast() {
    this.toastErrorMessage = '';
    this.displayErrorToast = false;
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
