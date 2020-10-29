import {Component, HostListener, Input, OnInit} from '@angular/core';
import {UserDetails} from '../../../models/user-details';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {IsTeacherClassMasterService} from '../../../services/study-class.service';
import {StudyClassAtRisk} from '../../../models/study-class-name';
import {StudentAtRisk} from '../../../models/student-data-list';
import {StudyClassesAtRiskService} from '../../../services/statistics-services/school-statistics.service';
import {OwnStudentsAtRiskService, OwnStudentsRiskEvolutionService} from '../../../services/statistics-services/students-statistics.service';
import {Column} from '../../../shared/reports-table/reports-table.component';
import {InactiveParentsService} from '../../../services/statistics-services/inactive-parents.service';
import {InactiveParent} from '../../../models/parent';
import * as moment from 'moment';
import {findIndex} from 'lodash';

@Component({
  selector: 'app-home-teacher',
  templateUrl: './home-teacher.component.html',
  styleUrls: ['./home-teacher.component.scss', '../home.component.scss']
})
export class HomeTeacherComponent implements OnInit {

  @Input() userDetails: UserDetails;
  getDayOfTheWeek = getDayOfTheWeek;
  isTeacherClassMaster: boolean = false;

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

  constructor(private isTeacherClassMasterService: IsTeacherClassMasterService,
              private studyClassesAtRiskService: StudyClassesAtRiskService,
              private ownStudentsEvolutionService: OwnStudentsRiskEvolutionService,
              private ownStudentsAtRiskService: OwnStudentsAtRiskService,
              private inactiveParentsService: InactiveParentsService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.fetchTeacherInfo();
    this.ownStudentsChartView = handleChartWidthHeight();
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
      this.tabs = [
        {id: 'my_own_classes', name: 'Clasele mele'},
        {id: 'class_master_data', name: 'Dirigentie'}
      ];
      this.activeTab = this.tabs[0].id;
    }
  }

  fetchPageData(): void {
    this.studyClassesAtRiskService.getData(this.forceRequest)

      .subscribe(response => {
        this.studyClassesAtRiskList = response;
        this.generateStudyClassesTable();
      });

    if (this.isTeacherClassMaster) {
      const classId = this.isTeacherClassMasterService.getOwnClassId();

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
      this.ownStudentsEvolutionService.getData(true, classId.toString())
        .subscribe(response => {
          this.displayChart = shouldDisplayChart(response);
          this.ownStudentsEvolutionList = formatChartData(response, 'Elevi', moment().month());
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
      minWidth: '150'
    }));
    this.studyClassesAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '110'
    }));
  }

  generateOwnStudentsAtRiskTable(): void {
    this.ownStudentsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'link-button',
      link: (value: StudentAtRisk) => {
        return `manage-users/${value.id}/view`;
      },
      minWidth: '150'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      dataKey: this.ownStudentsAtRiskList[0]?.avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'simple-cell',
      minWidth: '120'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell',
      minWidth: '150'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate / an',
      dataKey: this.ownStudentsAtRiskList[0]?.unfounded_abs_count_annual ? 'unfounded_abs_count_annual'
        : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell',
      minWidth: '240'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Notă purtare',
      dataKey: this.ownStudentsAtRiskList[0]?.behavior_grade_annual ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'numbered-cell',
      minWidth: '100'
    }));
  }

  generateInactiveParentsTable(): void {
    this.inactiveParentsTable.push(new Column({
      name: 'Nume părinte',
      dataKey: 'full_name',
      columnType: 'link-button',
      link: (value: InactiveParent) => {
        return `manage-users/${value.id}/view`;
      },
      minWidth: '150'
    }));
    this.inactiveParentsTable.push(new Column({
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'link-button',
      link: (value: InactiveParent) => {
        return `manage-users/${value.student_id}/view`;
      },
      minWidth: '200'
    }));
    this.inactiveParentsTable.push(new Column({
      name: 'Ultima dată activ',
      dataKey: 'last_online',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '100'
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
   this.ownStudentsChartView = handleChartWidthHeight();
  }
}
