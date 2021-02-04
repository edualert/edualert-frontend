import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UserDetails } from '../../../models/user-details';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, shouldDisplayChart } from '../../../shared/utils';
import { IsTeacherClassMasterService } from '../../../services/study-class.service';
import { StudyClassAtRisk } from '../../../models/study-class-name';
import { StudentAtRisk } from '../../../models/student-data-list';
import { StudyClassesAtRiskService } from '../../../services/statistics-services/school-statistics.service';
import { OwnStudentsAtRiskService, StudentsRiskEvolutionService } from '../../../services/statistics-services/students-statistics.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import { InactiveParentsService } from '../../../services/statistics-services/inactive-parents.service';
import { InactiveParent } from '../../../models/parent';
import * as moment from 'moment';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';
import { ViewUserModalComponent } from '../../manage-users/view-user-modal/view-user-modal.component';

@Component({
  selector: 'app-home-teacher',
  templateUrl: './home-teacher.component.html',
  styleUrls: ['./home-teacher.component.scss', '../home.component.scss']
})
export class HomeTeacherComponent implements OnInit {
  @Input() userDetails: UserDetails;
  @ViewChild('appViewUserModal', {'static': false}) appViewUserModal: ViewUserModalComponent;

  isTeacherClassMaster: boolean = false;

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  studyClassesAtRiskList: StudyClassAtRisk[];
  studyClassesAtRiskTable: Column[] = [];

  ownStudentsAtRiskList: StudentAtRisk[];
  ownStudentsAtRiskTable: Column[] = [];

  inactiveParentsList: InactiveParent[];
  inactiveParentsTable: Column[] = [];

  forceRequest: boolean = true;

  ownStudentsEvolutionList: any;
  ownStudentsChartView: any[];
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  xAxis: boolean = true;
  yAxis: boolean = true;
  displayChart: boolean;

  graphSubtitle: string;

  tabs: any[] = [];
  activeTab: string;
  noDataMessage: string = 'Nu există rapoarte disponibile.';
  shouldDisplayNoDataMessage: boolean = false;

  constructor(private isTeacherClassMasterService: IsTeacherClassMasterService,
              private studyClassesAtRiskService: StudyClassesAtRiskService,
              private ownStudentsEvolutionService: StudentsRiskEvolutionService,
              private ownStudentsAtRiskService: OwnStudentsAtRiskService,
              private inactiveParentsService: InactiveParentsService,
              private currentAcademicYearService: CurrentAcademicYearService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.ownStudentsChartView = handleChartWidthHeight();
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

      if (now > moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isFirstSemesterEnded = true;
      }
      if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isSecondSemesterEnded = true;
      }

      this.fetchTeacherInfo();
    });
  }

  fetchTeacherInfo(): void {
    this.isTeacherClassMasterService.verifyIfClassMaster()
      .subscribe((response: boolean) => {
        this.isTeacherClassMaster = response;
        this.setTabs();
        this.fetchPageData();
        this.forceRequest = false;
      });
  }

  setTabs(): void {
    if (this.isTeacherClassMaster) {
      if (!this.isFirstSemesterEnded) {
        this.tabs = [
          {id: 'class_master_data', name: 'Dirigenție'}
        ];
      } else {
        this.tabs = [
          {id: 'my_own_classes', name: 'Clasele mele'},
          {id: 'class_master_data', name: 'Dirigenție'}
        ];
      }
      this.activeTab = this.tabs[0].id;
    } else if (!this.isFirstSemesterEnded) {
      this.shouldDisplayNoDataMessage = true;
    }
  }

  fetchPageData(): void {
    if (this.shouldDisplayNoDataMessage) {
      return;
    }

    this.studyClassesAtRiskService.getData(this.forceRequest)
      .subscribe(response => {
        this.studyClassesAtRiskList = response;
        this.generateStudyClassesTable();
      });

    if (this.isTeacherClassMaster) {
      this.inactiveParentsService.getData(this.forceRequest)
        .subscribe(response => {
          this.inactiveParentsList = response;
          this.generateInactiveParentsTable();
        });
      this.ownStudentsAtRiskService.getData(this.forceRequest)
        .subscribe(response => {
          this.ownStudentsAtRiskList = response;
          this.generateOwnStudentsAtRiskTable();
        });
      this.ownStudentsEvolutionService.getData(true)
        .subscribe(response => {
          this.displayChart = shouldDisplayChart(response);
          this.ownStudentsEvolutionList = formatChartData(response, 'Elevi');
        });
    }
  }

  changeTab(tabClicked: string): void {
    this.activeTab = tabClicked;
  }

  generateStudyClassesTable(): void {
    this.studyClassesAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'class-name',
      minWidth: '150px'
    }));
    this.studyClassesAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '110px'
    }));
  }

  generateOwnStudentsAtRiskTable(): void {
    this.ownStudentsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal-fixed-max-width',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 5,
      minWidth: '120px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: 3,
      minWidth: '150px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate / an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
      minWidth: '240px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Notă purtare',
      dataKey: this.isSecondSemesterEnded ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 'behavior_grade_limit',
      minWidth: '100px'
    }));
  }

  generateInactiveParentsTable(): void {
    this.inactiveParentsTable.push(new Column({
      name: 'Nume părinte',
      dataKey: 'full_name',
      columnType: 'user-details-modal-fixed-max-width',
      link: (value: InactiveParent) => {
        return value.id;
      },
      minWidth: '200px'
    }));
    this.inactiveParentsTable.push(new Column({
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal-fixed-max-width',
      link: (value: InactiveParent) => {
        return value.children[0].id;
      },
      minWidth: '200px'
    }));
    this.inactiveParentsTable.push(new Column({
      name: 'Ultima dată activ',
      dataKey: 'last_online',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '100px'
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.ownStudentsChartView = handleChartWidthHeight();
  }

  openUserModal(event) {
    this.appViewUserModal.open(event);
  }
}
