import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
export class ClassListDetailComponent implements OnInit {
  private classId: string;

  classDetails: ClassDetails;
  ownPupilsData: any[];
  subjectsDataList: { studentListData: any, subjectId: number }[];

  tabs: TableTab[];
  activeTab: TableTab;
  tableData: any;

  @ViewChild('addGradesBulkModal', {static: false}) addGradesBulkModal: AddGradesBulkModalComponent;
  @ViewChild('addAbsencesBulkModal', {static: false}) addAbsencesBulkModal: AddAbsencesBulkModalComponent;
  @ViewChild('settingsModal', {static: false}) settingsModal: SettingsModalComponent;

  // The Own Pupils tab (only for class master) will always have id 0
  readonly classPupilsTab: string | number = 0;
  classMasterTab: string | number = -1;

  constructor(private activatedRoute: ActivatedRoute,
              private httpClient: HttpClient,
              private router: Router) {
  }

  ngOnInit(): void {
    this.classId = this.activatedRoute.snapshot.params['id'];
    this.tabs = [];
    this.fetchClassData();
  }

  private fetchClassData(): void {

    this.httpClient.get(`own-study-classes/${this.classId}/`).subscribe(response => {
      console.log(response);
      this.classDetails = new ClassDetails(response);
      this.initialiseTabs();

      if (this.classDetails.is_class_master) {
        this.fetchOwnPupilData();
      }
      this.fetchCatalogData();
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
        return new TableTab({id: subject.id, name: subject.name, tableLayout});
      })
    );
    this.activeTab = this.tabs[0];
  }

  private fetchOwnPupilData() {
    const dataPath = 'own-study-classes/' + this.classId + '/pupils/';
    this.httpClient.get(dataPath).subscribe((response: any[]) => {
      this.ownPupilsData = response;
    });
  }

  private fetchCatalogData(): void {
    this.subjectsDataList = [];
    const requests: { [key: string]: Observable<any> } = {};

    // Prepare requests for all the taught subjects
    this.classDetails.taught_subjects.forEach((subject) => {
      requests[subject.id] = this.httpClient.get(`own-study-classes/${this.classId}/subjects/${subject.id}/catalogs/`);
    });
    // Make all requests, populate the internal data with the results
    forkJoin(requests).subscribe((responses) => {
      this.subjectsDataList = this.classDetails.taught_subjects.map(
        (subject: Subject) => ({studentListData: responses[subject.id], subjectId: subject.id})
      );
      // this.subjectsDataList = Object.keys(responses).map((subjectId) => ({studentListData: responses[subjectId], subjectId: parseInt(subjectId, 10)}));
      this.tableData = this.subjectsDataList[0].studentListData;
    });
  }

  changeTab(tab: any) {
    const tabIndex = findIndex(this.tabs, {id: parseInt(tab, 10)});
    this.activeTab = this.tabs[tabIndex];

    if (tab === this.classPupilsTab && this.classDetails?.is_class_master) {
      this.tableData = this.ownPupilsData;
    } else {
      this.tableData = cloneDeep(this.subjectsDataList[findIndex(this.subjectsDataList, {subjectId: parseInt(tab, 10)})].studentListData);
    }
  }

  provideButtonsList() {
    if (this.classDetails?.is_class_master && this.classPupilsTab === this.activeTab.id) {
      return [{
        text: 'Trimite mesaj clasă',
        buttonCallbackFn: this.sendClassMessageList
      },
        {
          text: 'Exportă catalog',
          buttonCallbackFn: this.openAddBulkGradesModal
        }
      ];
    } else if (this.classDetails?.is_class_master && this.classMasterTab === this.activeTab.id) {
      return [{
        text: 'Trimite mesaj clasă',
        buttonCallbackFn: this.sendClassMessageList
      },
        {
          text: 'Adaugă absențe',
          buttonCallbackFn: this.openAddBulkAbsencesModal.bind(this)
        },
        {
          text: 'Exportă catalog',
          buttonCallbackFn: this.openAddBulkGradesModal
        }
      ];
    }
    return [{
      text: 'Trimite mesaj clasă',
      buttonCallbackFn: this.sendClassMessageList
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
        buttonCallbackFn: this.openAddBulkGradesModal
      }
    ];
  }

  sendClassMessageList() {
    console.log('Trimite mesaj clasă');
  }

  openAddBulkGradesModal() {
    const baseUrl = `own-study-classes/${this.classDetails?.id.toString()}/subjects/${this.activeTab.id.toString()}`;
    const modalData = {
      classGrade: this.classDetails?.class_grade,
      classLetter: this.classDetails?.class_letter,
      students: this.tableData,
      saveGradesCallback: (addedGrades: BulkAddedGrades) => {
        this.httpClient.post(`${baseUrl}/bulk-grades/`, addedGrades).subscribe((response) => {
          if (Object.keys(response).length) {
            this.tableData = response['catalogs'];
            this.addGradesBulkModal.close();
          }
        });
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
        this.httpClient.post(`${baseUrl}/bulk-absences/`, addedAbsences).subscribe((response) => {
          if (Object.keys(response).length) {
            this.tableData = response['catalogs'];
            this.addAbsencesBulkModal.close();
          }
        });
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
    const currentSubject = this.subjectsDataList[findIndex(this.subjectsDataList, {subjectId: tabBeforeRequest})];

    request.subscribe((response: any) => {
      const studentIndex = findIndex(currentSubject.studentListData, {id: response.id});
      if (studentIndex >= 0) {
        currentSubject.studentListData[studentIndex] = response;
      }

      // Do not update TableData if tab has been changed while the request was being made.
      if (this.activeTab.id === tabBeforeRequest) {
        this.tableData = cloneDeep(this.subjectsDataList[findIndex(this.subjectsDataList, {subjectId: tabBeforeRequest})].studentListData);
      }
    });
  }

  saveSingleGrade(value: { grade: { selectedGrade: number, selectedDate: Date, id: number }, id: number, semester: string }) {
    let request;
    if (value.grade.id) {
      request = this.httpClient.put(
        `grades/${value.grade.id}/`,
        {
          grade: value.grade.selectedGrade,
          taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
          grade_type: 'REGULAR'
        }
      );
    } else {
      request = this.httpClient.post(
        `catalogs/${value.id}/grades/`,
        {
          grade: value.grade.selectedGrade,
          taken_at: moment(value.grade.selectedDate).format('DD-MM-YYYY'),
          grade_type: 'REGULAR'
        }
      );
    }
    this.modifyCatalog(request);
  }

  addSingleAbsence(value: { absence: { date: Date, isFounded: boolean }, id: number, semester: string }): void {
    const request = this.httpClient.post(
      `catalogs/${value.id}/absences/`,
      {
        taken_at: moment(value.absence.date).format('DD-MM-YYYY'),
        isFounded: value.absence.isFounded
      }
    );
    this.modifyCatalog(request);
  }

  deleteGrade(grade: any): void {
    const request = this.httpClient.delete(`grades/${grade.id}/`);
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

}

class BulkAddedGrades {
  taken_at: string;
  student_grades: StudentToGrade;
}

class StudentToGrade {
  student: string | number;
  grade: number;
}

class BulkAddedAbsences {
  taken_at: string;
  student_absences: StudentToAbsence;
}

class StudentToAbsence {
  student: string | number;
  is_founded: boolean;

}
