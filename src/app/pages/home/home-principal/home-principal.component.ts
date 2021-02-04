import { Component, HostListener, Input, OnInit } from '@angular/core';
import { UserDetails } from '../../../models/user-details';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, shouldDisplayChart } from '../../../shared/utils';
import { StudyClassesAtRiskService } from '../../../services/statistics-services/school-statistics.service';
import { StudyClassAtRisk } from '../../../models/study-class-name';
import { AcademicProfileAtRisk } from '../../../models/academic-program-details';
import { InactiveTeacher } from '../../../models/teacher';
import { StudentAtRisk } from '../../../models/student-data-list';
import { AcademicProgramsAtRiskService } from '../../../services/statistics-services/academic-programs-statistics.service';
import { SchoolStudentsAtRiskService, StudentsRiskEvolutionService } from '../../../services/statistics-services/students-statistics.service';
import { InactiveTeachersService } from '../../../services/statistics-services/inactive-teachers.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';

@Component({
  selector: 'app-home-principal',
  templateUrl: './home-principal.component.html',
  styleUrls: ['./home-principal.component.scss', '../home.component.scss']
})
export class HomePrincipalComponent implements OnInit {
  @Input() userDetails: UserDetails;
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

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  constructor(private studyClassesAtRiskService: StudyClassesAtRiskService,
              private studentsAtRiskService: SchoolStudentsAtRiskService,
              private studentsEvolutionService: StudentsRiskEvolutionService,
              private academicProgramsAtRiskService: AcademicProgramsAtRiskService,
              private inactiveTeachersService: InactiveTeachersService,
              private currentAcademicYearService: CurrentAcademicYearService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.studentsChartView = handleChartWidthHeight();
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

      if (now > moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isFirstSemesterEnded = true;
      }
      if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isSecondSemesterEnded = true;
      }

      this.fetchPageData();
    });
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
        this.studentsEvolutionList = formatChartData(response, 'Elevi');
      });
  }

  generateAcademicProfilesAtRiskTable(): void {
    this.academicProgramsAtRiskColumns.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume profil',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '200px'
    }));
    this.academicProgramsAtRiskColumns.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      minWidth: '130px',
      columnType: 'numbered-cell'
    }));
  }

  generateSchoolStudyClassesAtRiskTable(): void {
    this.schoolStudyClassesAtRiskColumns.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'class-name',
      minWidth: '100px'
    }));
    this.schoolStudyClassesAtRiskColumns.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '130px'
    }));
  }

  generateTeachersTable(): void {
    this.inactiveTeachersTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume profesor',
      dataKey: 'full_name',
      columnType: 'link-button',
      link: (value: InactiveTeacher) => {
        return `/manage-users/${value.id}/view`;
      },
      minWidth: '200px',
    }));
    this.inactiveTeachersTable.push(new Column({
      name: 'Data ultimei modificări',
      dataKey: 'last_change_in_catalog',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '150px'
    }));
  }

  generateSchoolStudentsAtRiskTable(): void {
    this.schoolStudentsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'link-button-fixed-max-width',
      link: (value: StudentAtRisk) => {
        return `/manage-users/${value.student.id}/view`;
      },
      minWidth: '200px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Clasă',
      dataKey: 'class_full_name',
      columnType: 'simple-cell',
      minWidth: '60px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 5,
      minWidth: '100px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: 3,
      minWidth: '110px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate / an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
      minWidth: '240px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Notă purtare',
      dataKey: this.isSecondSemesterEnded ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 'behavior_grade_limit',
      minWidth: '100px'
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.studentsChartView = handleChartWidthHeight();
  }

}
