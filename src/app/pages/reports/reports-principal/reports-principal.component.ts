import { AfterViewInit, Component, EventEmitter, HostListener, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  StudyClassesAbsencesService,
  StudyClassesAtRiskService, StudyClassesAverageService
} from '../../../services/statistics-services/school-statistics.service';
import {
  SchoolStudentsAtRiskService,
  StudentsRiskEvolutionService
} from '../../../services/statistics-services/students-statistics.service';
import {
  AcademicProgramsAbsencesService,
  AcademicProgramsAtRiskService,
  AcademicProgramsAverageService
} from '../../../services/statistics-services/academic-programs-statistics.service';
import { InactiveTeachersService } from '../../../services/statistics-services/inactive-teachers.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import { StudentAtRisk } from '../../../models/student-data-list';
import { InactiveTeacher } from '../../../models/teacher';
import * as moment from 'moment';
import { Absences } from '../../../models/institution-statistics';
import { principalTabsMappingTypes, principalTabs } from '../reports-tabs';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, shouldDisplayChart } from '../../../shared/utils';
import { ScrollableList } from '../../list-page/scrollable-list';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';
import { findIndex } from 'lodash';

@Component({
  selector: 'app-reports-principal',
  templateUrl: './reports-principal.component.html',
  styleUrls: ['./reports-principal.component.scss', '../reports.component.scss']
})
export class ReportsPrincipalComponent extends ScrollableList implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  @Output() changeUserIdForModal = new EventEmitter<string | number>();
  @Input() initialQueryParams: string;

  academicProgramsAtRiskTable: Column[] = [];
  academicProgramsAveragesTable: Column[] = [];
  academicProgramsAbsencesTable: Column[] = [];
  schoolStudyClassesAtRiskTable: Column[] = [];
  schoolStudyClassesAveragesTable: Column[] = [];
  schoolStudyClassesAbsencesTable: Column[] = [];
  schoolStudentsAtRiskTable: Column[] = [];
  inactiveTeachersTable: Column[] = [];

  tabs_top: { name: string, id: principalTabs }[] = [];
  tabs_bottom_profiles: { name: string, id: principalTabs }[] = [];
  tabs_bottom_classes: { name: string, id: principalTabs }[] = [];
  tabs_bottom_students: { name: string, id: principalTabs }[] = [];
  tabs_bottom_teachers: { name: string, id: principalTabs }[] = [];

  data = {
    profiles: {
      academic_programs_at_risk: null,
      academic_programs_average: null,
      academic_programs_absences: null,
    },
    classes: {
      study_classes_at_risk: null,
      study_classes_average: null,
      study_classes_absences: null,
    },
    students: {
      students_at_risk: null,
      students_risk_evolution: {
        0: null, 1: null, 2: null, 3: null, 4: null,
        5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
      },
    },
    teachers: {
      inactive_teachers: null,
    },
  };

  currentPages = {
    classes: {
      study_classes_at_risk: {
        currentPage: 1,
        lastRequestedPage: 0,
        totalCount: 0,
        elementCount: 0
      }
    },
    students: {
      students_at_risk: {
        currentPage: 1,
        lastRequestedPage: 0,
        totalCount: 0,
        elementCount: 0
      }
    },
    profiles: {
      academic_programs_at_risk: {
        currentPage: 1,
        lastRequestedPage: 0,
        totalCount: 0,
        elementCount: 0
      }
    },
    teachers: {
      inactive_teachers: {
        currentPage: 1,
        lastRequestedPage: 0,
        totalCount: 0,
        elementCount: 0
      }
    }
  };

  tabs_bottom;
  activeTabTop: principalTabs;
  activeTabBottom: principalTabs;
  month: number = moment().month();

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  loading = false;

  graphSubtitle: string;
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  generalChartView: any[];
  displayChart: boolean;

  pageSize: number = 30;
  tableIsGenerated: boolean = false;

  private buildTabs(): void {
    if (this.isFirstSemesterEnded) {
      this.tabs_top = [
        {name: 'Profile', id: 'profiles'},
        {name: 'Clase', id: 'classes'},
        {name: 'Elevi', id: 'students'},
      ];
      this.tabs_bottom_profiles = [
        {name: 'Top profile cu risc', id: 'academic_programs_at_risk'},
        {name: 'Top profile după medii', id: 'academic_programs_average'},
        {name: 'Top profile după absențe', id: 'academic_programs_absences'}
      ];
      this.tabs_bottom_classes = [
        {name: 'Top clase cu risc', id: 'study_classes_at_risk'},
        {name: 'Top clase după medii', id: 'study_classes_average'},
        {name: 'Top clase după absențe', id: 'study_classes_absences'}
      ];
      this.tabs_bottom_students = [
        {name: 'Top elevi cu risc', id: 'students_at_risk'},
        {name: 'Evoluție număr elevi cu risc ', id: 'students_risk_evolution'},
      ];

      if (!this.isSecondSemesterEnded) {
        this.tabs_top.push({name: 'Profesori', id: 'teachers'});
        this.tabs_bottom_teachers = [
          {name: 'Top profesori inactivi', id: 'inactive_teachers'},
        ];
      }
    } else {
      this.tabs_top = [
        {name: 'Elevi', id: 'students'},
        {name: 'Profesori', id: 'teachers'},
      ];
      this.tabs_bottom_students = [
        {name: 'Top elevi cu risc', id: 'students_at_risk'},
        {name: 'Evoluție număr elevi cu risc ', id: 'students_risk_evolution'},
      ];
      this.tabs_bottom_teachers = [
        {name: 'Top profesori inactivi', id: 'inactive_teachers'},
      ];
    }

    if (findIndex(this.tabs_top, {id: this.activeTabTop}) < 0) {
      this.activeTabTop = this.tabs_top[0].id;
    }
    this.setBottomTabs();
    if (findIndex(this.tabs_bottom, {id: this.activeTabBottom}) < 0) {
      this.activeTabBottom = this.tabs_bottom[0].id;
    }
  }

  private setBottomTabs(): void {
    if (this.activeTabTop === 'profiles') {
      this.tabs_bottom = this.tabs_bottom_profiles;
    } else if (this.activeTabTop === 'classes') {
      this.tabs_bottom = this.tabs_bottom_classes;
    } else if (this.activeTabTop === 'students') {
      this.tabs_bottom = this.tabs_bottom_students;
    } else if (this.activeTabTop === 'teachers') {
      this.tabs_bottom = this.tabs_bottom_teachers;
    }
  }

  changeTab(event: principalTabs, type: string): void {
    document.body.scrollTop = 0;
    setTimeout(() => {
      if (type === 'top') {
        this.activeTabTop = event;
        switch (this.activeTabTop) {
          case 'profiles':
            this.tabs_bottom = this.tabs_bottom_profiles;
            this.activeTabBottom = this.tabs_bottom_profiles[0].id;
            break;
          case 'classes':
            this.tabs_bottom = this.tabs_bottom_classes;
            this.activeTabBottom = this.tabs_bottom_classes[0].id;
            break;
          case 'students':
            this.tabs_bottom = this.tabs_bottom_students;
            this.activeTabBottom = this.tabs_bottom_students[0].id;
            break;
          case 'teachers':
            this.tabs_bottom = this.tabs_bottom_teachers;
            this.activeTabBottom = this.tabs_bottom_teachers[0].id;
            break;
          default:
            this.tabs_bottom = this.tabs_bottom_profiles;
            this.activeTabBottom = this.tabs_bottom_profiles[0].id;
            break;
        }
        this.changeUrlParamsEvent.next({
          top_tab: this.activeTabTop,
          bottom_tab: this.activeTabBottom
        });
      }
      if (type === 'bottom') {
        this.activeTabBottom = event;
        this.changeUrlParamsEvent.next({bottom_tab: this.activeTabBottom});
      }
      this.month = moment().month();

      if (this.infiniteScrollTabIds.includes(this.activeTabBottom)) {
        this.totalCount = this.currentPages[this.activeTabTop][this.activeTabBottom].totalCount;
        this.elementCount = this.currentPages[this.activeTabTop][this.activeTabBottom].elementCount;
        if (this.data[this.activeTabTop][this.activeTabBottom] === null) {
          this.currentPages[this.activeTabTop][this.activeTabBottom].currentPage = 1;
        }
        this.page = this.currentPages[this.activeTabTop][this.activeTabBottom].currentPage;

        this.activeTab = this.activeTabBottom;
      }
    }, 10);
  }

  changeMonth(event: string) {
    this.month = new Date(event).getMonth();
    this.fetchData(this.activeTabTop, this.activeTabBottom);
  }

  constructor(injector: Injector,
              private studyClassesAtRiskService: StudyClassesAtRiskService,
              private studyClassesAbsencesService: StudyClassesAbsencesService,
              private studyClassesAverageService: StudyClassesAverageService,
              private schoolStudentsAtRiskService: SchoolStudentsAtRiskService,
              private studentsEvolutionService: StudentsRiskEvolutionService,
              private academicProgramsAtRiskService: AcademicProgramsAtRiskService,
              private academicProgramsAbsencesService: AcademicProgramsAbsencesService,
              private academicProgramsAverageService: AcademicProgramsAverageService,
              private inactiveTeachersService: InactiveTeachersService,
              private currentAcademicYearService: CurrentAcademicYearService) {
    super();
    this.scrollHandle = this.scrollHandle.bind(this);
    this.initialBodyHeight = document.body.getBoundingClientRect().height;
    this.infiniteScrollTabIds = [
      'students_at_risk',
      'study_classes_at_risk',
      'academic_programs_at_risk',
      'inactive_teachers'
    ];
    this.requestDataFunc = this.fetchData;

    this.generateAcademicProfilesAtRiskTable = this.generateAcademicProfilesAtRiskTable.bind(this);
    this.generateAcademicProgramsAveragesTable = this.generateAcademicProgramsAveragesTable.bind(this);
    this.generateAcademicProgramsAbsencesTable = this.generateAcademicProgramsAbsencesTable.bind(this);
    this.generateSchoolStudyClassesAtRiskTable = this.generateSchoolStudyClassesAtRiskTable.bind(this);
    this.generateSchoolStudyClassesAveragesTable = this.generateSchoolStudyClassesAveragesTable.bind(this);
    this.generateSchoolStudyClassesAbsencesTable = this.generateSchoolStudyClassesAbsencesTable.bind(this);
    this.generateSchoolStudentsAtRiskTable = this.generateSchoolStudentsAtRiskTable.bind(this);
    this.generateInactiveTeachersTable = this.generateInactiveTeachersTable.bind(this);
  }

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll', this.scrollHandle);
  }

  getPreviousCurrentAndNextMonth(month: number) {
    const mapping = {'-1': '12', 0: '1', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9', 9: '10', 10: '11', 11: '12', 12: '1'};
    return {
      current: mapping[month],
      prev: mapping[month - 1],
      next: mapping[month + 1],
    };
  }

  fetchData(id_top: string, id_bottom: string) {
    this.tableIsGenerated = !(this.data[id_top][id_bottom] === null || this.data[id_top][id_bottom] === undefined);
    if (this.data[id_top][id_bottom] === null) {
      this.tableIsGenerated = false;
      document.body.removeEventListener('scroll', this.scrollHandle);
      document.body.addEventListener('scroll', this.scrollHandle);
    }

    if (this.data[id_top] !== undefined && this.data[id_top][id_bottom] !== null) {
      if (this.infiniteScrollTabIds.includes(id_bottom) && this.page === this.currentPages[this.activeTabTop][this.activeTabBottom].lastRequestedPage) {
        return;
      }
      if (!['students_risk_evolution', ...this.infiniteScrollTabIds].includes(id_bottom)) {
        return;
      }
    }

    if (this.infiniteScrollTabIds.includes(id_bottom)) {
      this.currentPages[id_top][id_bottom].currentPage = this.page;
    }

    const previousMonth = this.month === 0 ? 11 : this.month - 1;
    if (id_bottom === 'students_risk_evolution' && this.data['students'] !== undefined &&
      this.data['students']['students_risk_evolution'][previousMonth] &&
      this.data['students']['students_risk_evolution'][this.month]) {
      this.displayChart = shouldDisplayChart(this.data['students']['students_risk_evolution'][this.month]['chartData'][0]['series']);
      return;
    }

    this.loading = this.initialRequestInProgress = true;
    const months_students = this.getPreviousCurrentAndNextMonth(this.month);

    const requests: { [tab in principalTabsMappingTypes] } = {
      'profiles-academic_programs_at_risk': {
        request: this.academicProgramsAtRiskService.getData(true, null, this.pageSize, this.page),
        generate: this.generateAcademicProfilesAtRiskTable
      },
      'profiles-academic_programs_average': {
        request: this.academicProgramsAverageService.getData(false),
        generate: this.generateAcademicProgramsAveragesTable
      },
      'profiles-academic_programs_absences': {
        request: this.academicProgramsAbsencesService.getData(false),
        generate: this.generateAcademicProgramsAbsencesTable
      },
      'classes-study_classes_at_risk': {
        request: this.studyClassesAtRiskService.getData(true, null, this.pageSize, this.page),
        generate: this.generateSchoolStudyClassesAtRiskTable
      },
      'classes-study_classes_average': {
        request: this.studyClassesAverageService.getData(false),
        generate: this.generateSchoolStudyClassesAveragesTable
      },
      'classes-study_classes_absences': {
        request: this.studyClassesAbsencesService.getData(false),
        generate: this.generateSchoolStudyClassesAbsencesTable
      },
      'students-students_at_risk': {
        request: this.schoolStudentsAtRiskService.getData(true, null, this.pageSize, this.page),
        generate: this.generateSchoolStudentsAtRiskTable
      },
      'students-students_risk_evolution': {
        request: this.studentsEvolutionService.getData(true, '', months_students.current),
        requestPrevious: this.studentsEvolutionService.getData(true, '', months_students.prev)
      },
      'teachers-inactive_teachers': {
        request: this.inactiveTeachersService.getData(true, null, this.pageSize, this.page),
        generate: this.generateInactiveTeachersTable
      }
    };

    const req = requests[`${id_top}-${id_bottom}`];
    if (id_bottom === 'students_risk_evolution') {
      if (!this.data[id_top][id_bottom][this.month]) {
        req.request.subscribe((response) => {
          this.data[id_top][id_bottom][this.month] = formatChartData(response, 'Elevi');
          this.displayChart = shouldDisplayChart(response);
          this.loading = false;
        }, error => {
          this.data[id_top][id_bottom][this.month] = error.detail;
          this.loading = false;
        });
      } else {
        this.displayChart = shouldDisplayChart(this.data[id_top][id_bottom][this.month]['chartData'][0]['series']);
      }

      if (previousMonth !== 7 && !this.data[id_top][id_bottom][previousMonth]) {
        req.requestPrevious.subscribe((response) => {
          this.data[id_top][id_bottom][previousMonth] = formatChartData(response, 'Elevi');
          this.loading = false;
        }, error => {
          this.data[id_top][id_bottom][previousMonth] = error.detail;
          this.loading = false;
        });
      }
      return;
    }

    req.request.subscribe((response) => {
      if (id_bottom === 'study_classes_absences') {
        this.data[id_top][id_bottom] = response.map(item => new Absences(
          {
            ...item,
            name: `Clasa ${item.class_grade} ${item.class_letter}`
          }));
      } else if (this.infiniteScrollTabIds.includes(id_bottom)) {
        if (this.data[id_top][id_bottom] !== null) {
          response.forEach(item => {
            this.data[id_top][id_bottom].push(item);
          });
        } else {
          this.data[id_top][id_bottom] = response;
        }
        switch (id_bottom) {
          case 'students_at_risk':
            this.currentPages[id_top][id_bottom].totalCount = this.schoolStudentsAtRiskService.getTotalCount();
            break;
          case 'study_classes_at_risk':
            this.currentPages[id_top][id_bottom].totalCount = this.studyClassesAtRiskService.getTotalCount();
            break;
          case 'academic_programs_at_risk':
            this.currentPages[id_top][id_bottom].totalCount = this.academicProgramsAtRiskService.getTotalCount();
            break;
          case 'inactive_teachers':
            this.currentPages[id_top][id_bottom].totalCount = this.inactiveTeachersService.getTotalCount();
            break;
        }
        this.totalCount = this.currentPages[id_top][id_bottom].totalCount;
        this.currentPages[id_top][id_bottom].elementCount = this.data[id_top][id_bottom]?.length;
        this.elementCount = this.currentPages[id_top][id_bottom].elementCount;
        this.currentPages[id_top][id_bottom].lastRequestedPage = this.page;
      } else {
        this.data[id_top][id_bottom] = response;
      }
      this.activeTab = this.activeTabBottom;
      this.loading = this.initialRequestInProgress = false;
      if (req.generate && !this.tableIsGenerated) {
        req.generate();
        this.tableIsGenerated = true;
      }
    });
  }

  generateAcademicProfilesAtRiskTable() {
    this.academicProgramsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume profil',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '230px'
    }));
    this.academicProgramsAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      minWidth: '130px',
      columnType: 'numbered-cell'
    }));
  }

  generateAcademicProgramsAveragesTable() {
    this.academicProgramsAveragesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume profil',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '230px'
    }));
    this.academicProgramsAveragesTable.push(new Column({
      name: 'Medie anuală profil',
      dataKey: this.isSecondSemesterEnded ? 'avg_annual' : 'avg_sem1',
      minWidth: '130px',
      columnType: 'graded-cell'
    }));
  }

  generateAcademicProgramsAbsencesTable() {
    this.academicProgramsAbsencesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume profil',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '230px'
    }));
    this.academicProgramsAbsencesTable.push(new Column({
      name: 'Număr mediu absențe nemotivate pe elev pe an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_avg_annual' : 'unfounded_abs_avg_sem1',
      columnType: 'numbered-cell',
      minWidth: '275px'
    }));
  }

  generateSchoolStudyClassesAtRiskTable() {
    this.schoolStudyClassesAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'class-name',
      minWidth: '200px'
    }));
    this.schoolStudyClassesAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '130px'
    }));
  }

  generateSchoolStudyClassesAveragesTable() {
    this.schoolStudyClassesAveragesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'class-name',
      minWidth: '200px'
    }));
    this.schoolStudyClassesAveragesTable.push(new Column({
      name: 'Medie anuală clasă',
      dataKey: this.isSecondSemesterEnded ? 'avg_annual' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '130px'
    }));
  }

  generateSchoolStudyClassesAbsencesTable() {
    this.schoolStudyClassesAbsencesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume clasă',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '230px'
    }));
    this.schoolStudyClassesAbsencesTable.push(new Column({
      name: 'Număr mediu absențe nemotivate pe elev pe an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_avg_annual' : 'unfounded_abs_avg_sem1',
      columnType: 'numbered-cell',
      minWidth: '275px'
    }));
  }

  generateSchoolStudentsAtRiskTable() {
    this.schoolStudentsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal-fixed-max-width',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '210px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Clasă',
      dataKey: 'class_full_name',
      columnType: 'simple-cell',
      minWidth: '100px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Medie generală anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 5,
      minWidth: '140px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe pe an',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: 3,
      minWidth: '140px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate pe an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
      minWidth: '240px'
    }));
    this.schoolStudentsAtRiskTable.push(new Column({
      name: 'Notă anuală purtare',
      dataKey: this.isSecondSemesterEnded ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 'behavior_grade_limit',
      minWidth: '120px'
    }));
  }

  generateInactiveTeachersTable() {
    this.inactiveTeachersTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume profesor',
      dataKey: 'full_name',
      columnType: 'user-details-modal',
      link: (value: InactiveTeacher) => {
        return value.id;
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

  ngOnInit(): void {
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();
      const firstSemEnd = moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf();
      const secondSemEnd = moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf();

      if (now > firstSemEnd) {
        this.isFirstSemesterEnded = true;
      }
      if (now > secondSemEnd) {
        this.isSecondSemesterEnded = true;
      }

      this.buildTabs();

      this.changeUrlParamsEvent.next({
        top_tab: this.activeTabTop,
        bottom_tab: this.activeTabBottom
      });

      this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
      window.setTimeout(() => this.generalChartView = handleChartWidthHeight(window.innerHeight), 500);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialQueryParams && changes.initialQueryParams.currentValue &&
      changes.initialQueryParams.currentValue !== changes.initialQueryParams.previousValue) {
      const tab_ids = changes.initialQueryParams.currentValue.split('-');
      this.activeTabTop = tab_ids[0];
      this.activeTabBottom = tab_ids[1];
      this.setBottomTabs();
      this.fetchData(this.activeTabTop, this.activeTabBottom);
    }
  }

  emitUserIdForModal(event) {
    this.changeUserIdForModal.next(event);
  }

  downloadCSVReport() {
    switch (this.activeTabBottom) {
      case 'students_at_risk':
        this.schoolStudentsAtRiskService.downloadStudentsAtRiskCSVReport();
        break;
    }
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.generalChartView = handleChartWidthHeight(window.innerHeight);
  }

}
