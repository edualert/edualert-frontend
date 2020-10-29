import {Component, HostListener, Input, OnInit} from '@angular/core';
import {UserDetails} from '../../../models/user-details';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {StudyClassesAtRiskService} from '../../../services/statistics-services/school-statistics.service';
import {StudyClassAtRisk} from '../../../models/study-class-name';
import {AcademicProfileAtRisk} from '../../../models/academic-program-details';
import {InactiveTeacher} from '../../../models/teacher';
import {StudentAtRisk} from '../../../models/student-data-list';
import {AcademicProgramsAtRiskService} from '../../../services/statistics-services/academic-programs-statistics.service';
import {StudentsAtRiskService, StudentsRiskEvolutionService} from '../../../services/statistics-services/students-statistics.service';
import {InactiveTeachersService} from '../../../services/statistics-services/inactive-teachers.service';
import {Column} from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import {findIndex} from 'lodash';

@Component({
  selector: 'app-home-principal',
  templateUrl: './home-principal.component.html',
  styleUrls: ['./home-principal.component.scss', '../home.component.scss']
})
export class HomePrincipalComponent implements OnInit {

  @Input() userDetails: UserDetails;
  getDayOfTheWeek = getDayOfTheWeek;
  graphSubtitle: string;

  academicProgramsAtRiskList: AcademicProfileAtRisk[];
  academicProgramsAtRiskColumns: Column[] = [];

  schoolStudyClassesAtRiskList: StudyClassAtRisk[];
  schoolStudyClassesAtRiskColumns: Column[] = [];

  inactiveTeachersList: InactiveTeacher[];
  inactiveTeachersTable: Column[] = [];

  schoolStudentsAtRiskList: StudentAtRisk[];
  schoolStudentsAtRiskTable: Column[] = [];

  forceRequest: boolean = true;

  studentsEvolutionList: any;
  studentsChartView: any[];
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  xAxis: boolean = true;
  yAxis: boolean = true;
  displayChart: boolean;

  constructor(private studyClassesAtRiskService: StudyClassesAtRiskService,
              private studentsAtRiskService: StudentsAtRiskService,
              private studentsEvolutionService: StudentsRiskEvolutionService,
              private academicProgramsAtRiskService: AcademicProgramsAtRiskService,
              private inactiveTeachersService: InactiveTeachersService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.fetchPageData();
    this.studentsChartView = handleChartWidthHeight();
    this.forceRequest = false;
  }

  fetchPageData(): void {
    this.studyClassesAtRiskService.getData(this.forceRequest)
      .subscribe(response => {
        this.schoolStudyClassesAtRiskList = response;
        this.generateSchoolStudyClassesAtRiskTable();
      });
    this.academicProgramsAtRiskService.getData(this.forceRequest)
      .subscribe(response => {
        this.academicProgramsAtRiskList = response;
        this.generateAcademicProfilesAtRiskTable();
      });
    this.inactiveTeachersService.getData(this.forceRequest)
      .subscribe(response => {
        this.inactiveTeachersList = response;
        this.generateTeachersTable();
      });
    this.studentsAtRiskService.getData(this.forceRequest)
      .subscribe(response => {
        this.schoolStudentsAtRiskList = response;
        this.generateSchoolStudentsAtRiskTable();
      });
    this.studentsEvolutionService.getData(true)
      .subscribe(response => {
        this.displayChart = shouldDisplayChart(response);
        this.studentsEvolutionList = formatChartData(response, 'Elevi', moment().month());
      });
  }

  generateAcademicProfilesAtRiskTable(): void {
    this.academicProgramsAtRiskColumns.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume profil',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '200'
    }));
    this.academicProgramsAtRiskColumns.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      minWidth: '130',
      columnType: 'numbered-cell'
    }));
  }

  generateSchoolStudyClassesAtRiskTable(): void {
    this.schoolStudyClassesAtRiskColumns.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'class-name',
      minWidth: '100'
    }));
    this.schoolStudyClassesAtRiskColumns.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '130'
    }));
  }

  generateTeachersTable(): void {
    this.inactiveTeachersTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume profesor',
      dataKey: 'full_name',
      columnType: 'link-button',
      link: (value: InactiveTeacher) => {
        return `manage-users/${value.id}/view`;
      },
      minWidth: '200',
    }));
    this.inactiveTeachersTable.push(new Column({
      name: 'Data ultimei modificări',
      dataKey: 'last_change_in_catalog',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '150'
    }));
  }

  generateSchoolStudentsAtRiskTable(): void {
    this.schoolStudentsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'link-button',
      link: (value: StudentAtRisk) => {
        return `manage-users/${value.student.id}/view`;
      },
      minWidth: '200'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Clasă',
      dataKey: 'class_full_name',
      columnType: 'simple-cell',
      minWidth: '60'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      dataKey: this.schoolStudentsAtRiskList[0].avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '100'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell',
      minWidth: '110'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate / an',
      dataKey: this.schoolStudentsAtRiskList[0].unfounded_abs_count_annual ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell',
      minWidth: '240'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Notă purtare',
      dataKey: this.schoolStudentsAtRiskList[0].behavior_grade_annual ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'numbered-cell',
      minWidth: '100'
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.studentsChartView = handleChartWidthHeight();
  }

}
