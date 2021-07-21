import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import {
  StudyClassesAtRiskService
} from '../../../services/statistics-services/school-statistics.service';
import {
  InactiveParentsService,
  OwnStudentsAbsencesService,
  OwnStudentsAtRiskService, OwnStudentsAverageService, OwnStudentsBehaviourGradesService,
  StudentsRiskEvolutionService
} from '../../../services/statistics-services/students-statistics.service';
import { IsTeacherClassMasterService } from '../../../services/study-class.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import { StudentAtRisk } from '../../../models/student-data-list';
import { InactiveParent } from '../../../models/parent';
import * as moment from 'moment';
import { classMasterTabsMappingTypes, notClassMasterTabsMappingTypes } from '../reports-tabs';
import { formatChartData, handleChartWidthHeight, removeChartTooltip, shouldDisplayChart } from '../../../shared/utils';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';
import { findIndex } from 'lodash';
import { ScrollableList } from '../../list-page/scrollable-list';
import { StudyClassAtRisk } from '../../../models/study-class-name';

@Component({
  selector: 'app-reports-teacher',
  templateUrl: './reports-teacher.component.html',
  styleUrls: ['./reports-teacher.component.scss', '../reports.component.scss']
})
export class ReportsTeacherComponent extends ScrollableList implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  @Output() changeUserIdForModal = new EventEmitter<string | number>();
  @Input() initialQueryParams: string;

  studyClassesAtRiskTable: Column[] = [];
  ownStudentsAtRiskTable: Column[] = [];
  ownStudentsAverageTable: Column[] = [];
  ownStudentsAbsencesTable: Column[] = [];
  ownStudentsBehaviourGradeTable: Column[] = [];
  inactiveParentsTable: Column[] = [];

  tabs_top: any[] = [];
  tabs_bottom_my_classes: any[] = [];
  tabs_bottom_class_mastery: any[] = [];
  tabs_bottom: any[] = [];

  activeTabTop: string;
  activeTabBottom: string;
  noDataMessage: string = 'Nu există rapoarte disponibile.';
  shouldDisplayNoDataMessage: boolean = false;

  month: number = moment().month();
  loading: boolean = false;
  loadingPreviousMonth: boolean = false;

  data = {
    my_classes: {
      study_classes_at_risk: null
    },
    class_mastery: {
      students_at_risk: null,
      own_students_average: null,
      own_students_absences: null,
      own_students_behaviour_grade: null,
      own_students_risk_evolution: {
        0: null, 1: null, 2: null, 3: null, 4: null,
        5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
      },
      inactive_parents: null,
    },
  };
  isTeacherClassMaster: boolean;

  currentPages = {
    my_classes: {
      study_classes_at_risk: {
        currentPage: 1,
        lastRequestedPage: 0,
        totalCount: 0,
        elementCount: 0
      }
    },
    class_mastery: {
      inactive_parents: {
        currentPage: 1,
        lastRequestedPage: 0,
        totalCount: 0,
        elementCount: 0
      }
    }
  };

  pageSize: number = 30;
  tableIsGenerated: boolean = false;

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  colorSchemeRed = {
    domain: ['#CC0033']
  };
  chartHolderElement: HTMLElement;
  generalChartView: any[];
  displayChart: boolean;

  changeTab(event: any, type: string): void {
    document.body.scrollTop = 0;
    setTimeout(() => {
      if (type === 'top') {
        this.activeTabTop = event;
        switch (this.activeTabTop) {
          case 'my_classes':
            this.tabs_bottom = this.tabs_bottom_my_classes;
            this.activeTabBottom = this.tabs_bottom_my_classes[0].id;
            break;
          case 'class_mastery':
            this.tabs_bottom = this.tabs_bottom_class_mastery;
            this.activeTabBottom = this.tabs_bottom_class_mastery[0].id;
            break;
          default:
            this.tabs_bottom = this.tabs_bottom_my_classes;
            this.activeTabBottom = this.tabs_bottom_my_classes[0].id;
            break;
        }
      }
      if (type === 'bottom') {
        this.activeTabBottom = event;
      }
      this.changeUrlParamsEvent.next({
        top_tab: this.activeTabTop,
        bottom_tab: this.activeTabBottom
      });
      this.month = moment().month();

      if (this.infiniteScrollTabIds.includes(this.activeTabBottom)) {
        this.totalCount = this.currentPages[this.activeTabTop][this.activeTabBottom].totalCount;
        this.elementCount = this.currentPages[this.activeTabTop][this.activeTabBottom].elementCount;
        if (this.data[this.activeTabTop][this.activeTabBottom] === null) {
          this.currentPages[this.activeTabTop][this.activeTabBottom].currentPage = 1;
        }
        this.page = this.currentPages[this.activeTabTop][this.activeTabBottom].currentPage;

        this.activeTab = this.activeTabBottom;
        this.tabTopActive = this.activeTabTop;
      }
    }, 10);
  }

  changeMonth(event: string): void {
    this.month = new Date(event).getMonth();
    if (this.isTeacherClassMaster !== undefined) {
      this.fetchData(this.activeTabTop, this.activeTabBottom);
    }
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
    if (this.shouldDisplayNoDataMessage || this.loading || this.loadingPreviousMonth) {
      return;
    }
    this.tableIsGenerated = !(this.data[id_top][id_bottom] === null || this.data[id_top][id_bottom] === undefined);
    if (this.data[id_top][id_bottom] === null) {
      this.tableIsGenerated = false;
      document.body.removeEventListener('scroll', this.scrollHandle);
      document.body.addEventListener('scroll', this.scrollHandle);
    }
    // If we already have data for that id don't make a request
    if (this.data[id_top] !== undefined && this.data[id_top][id_bottom] !== null) {
      if (this.infiniteScrollTabIds.includes(id_bottom) && this.page === this.currentPages[this.activeTabTop][this.activeTabBottom].lastRequestedPage) {
        return;
      }
      if (!['own_students_risk_evolution', ...this.infiniteScrollTabIds].includes(id_bottom)) {
        return;
      }
    }

    const previousMonth = this.month === 0 ? 11 : this.month - 1;
    if (id_bottom === 'own_students_risk_evolution' && this.data[id_top][id_bottom][previousMonth] && this.data[id_top][id_bottom][this.month]) {
      this.displayChart = shouldDisplayChart(this.data[id_top][id_bottom][this.month]['chartData'][0]['series']);
      return;
    }

    if (this.infiniteScrollTabIds.includes(id_bottom)) {
      this.currentPages[id_top][id_bottom].currentPage = this.page;
    }

    this.loading = true;
    const month = this.getPreviousCurrentAndNextMonth(this.month);

    const notClassMasterRequests = {
      'my_classes-study_classes_at_risk': {
        request: this.studyClassesAtRiskService.getData(true, null, this.pageSize, this.page),
        generate: this.generateStudyClassesAtRiskTable
      }
    };

    const classMasterRequests = {
      'my_classes-study_classes_at_risk': {
        request: this.studyClassesAtRiskService.getData(true, null, this.pageSize, this.page),
        generate: this.generateStudyClassesAtRiskTable
      },
      'class_mastery-students_at_risk': {
        request: this.ownStudentsAtRiskService.getData(true, null, 50),
        generate: this.generateOwnStudentsAtRiskTable
      },
      'class_mastery-own_students_average': {
        request: this.ownStudentsAverageService.getData(true),
        generate: this.generateOwnStudentsAverageTable
      },
      'class_mastery-own_students_absences': {
        request: this.ownStudentsAbsencesService.getData(true),
        generate: this.generateOwnStudentsAbsencesTable
      },
      'class_mastery-own_students_behaviour_grade': {
        request: this.ownStudentsBehaviourGradeService.getData(true),
        generate: this.generateOwnStudentsBehaviourGradeTable
      },
      'class_mastery-own_students_risk_evolution': {
        request: this.studentsEvolutionService.getData(true, '', month.current),
        requestPrevious: this.studentsEvolutionService.getData(true, '', month.prev)
      },
      'class_mastery-inactive_parents': {
        request: this.inactiveParentsService.getData(true, null, this.pageSize, this.page),
        generate: this.generateInactiveParentsTable
      },
    };

    let requests: { [tab in classMasterTabsMappingTypes]: any } | { [tab in notClassMasterTabsMappingTypes]: any };

    if (this.isTeacherClassMaster) {
      requests = {...classMasterRequests};
    } else {
      requests = {...notClassMasterRequests};
    }

    const req = requests[`${id_top}-${id_bottom}`];
    if (id_bottom === 'own_students_risk_evolution') {
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
        this.loading = false;
        this.displayChart = shouldDisplayChart(this.data[id_top][id_bottom][this.month]['chartData'][0]['series']);
      }

      if (previousMonth !== 7 && !this.data[id_top][id_bottom][previousMonth]) {
        this.loadingPreviousMonth = true;
        req.requestPrevious.subscribe((response) => {
          this.data[id_top][id_bottom][previousMonth] = formatChartData(response, 'Elevi');
          this.loading = false;
          this.loadingPreviousMonth = false;
        }, error => {
          this.data[id_top][id_bottom][previousMonth] = error.detail;
          this.loading = false;
          this.loadingPreviousMonth = false;
        });
      }
      return;
    }

    this.loading = this.initialRequestInProgress = true;
    req.request.subscribe((response) => {
      if (this.infiniteScrollTabIds.includes(id_bottom)) {
        if (this.data[id_top][id_bottom] !== null) {
          response.forEach(item => {
            this.data[id_top][id_bottom].push(item);
          });
        } else {
          this.data[id_top][id_bottom] = response;
        }
        switch (id_bottom) {
          case 'study_classes_at_risk':
            this.currentPages[id_top][id_bottom].totalCount = this.studyClassesAtRiskService.getTotalCount();
            break;
          case 'inactive_parents':
            this.currentPages[id_top][id_bottom].totalCount = this.inactiveParentsService.totalCount;
            break;
        }
        this.totalCount = this.currentPages[id_top][id_bottom].totalCount;
        this.currentPages[id_top][id_bottom].elementCount = this.data[id_top][id_bottom]?.length;
        this.elementCount = this.currentPages[id_top][id_bottom].elementCount;
        this.currentPages[id_top][id_bottom].lastRequestedPage = this.page;
        this.tabTopActive = this.activeTabTop;
        this.activeTab = this.activeTabBottom;
      } else {
        this.data[id_top][id_bottom] = response;
      }
      this.loading = this.initialRequestInProgress = false;
      if (req.generate && !this.tableIsGenerated) {
        req.generate();
        this.tableIsGenerated = true;
      }
    });
  }

  constructor(private isTeacherClassMasterService: IsTeacherClassMasterService,
              private studyClassesAtRiskService: StudyClassesAtRiskService,
              private studentsEvolutionService: StudentsRiskEvolutionService,
              private ownStudentsAverageService: OwnStudentsAverageService,
              private ownStudentsAbsencesService: OwnStudentsAbsencesService,
              private ownStudentsBehaviourGradeService: OwnStudentsBehaviourGradesService,
              private ownStudentsAtRiskService: OwnStudentsAtRiskService,
              private inactiveParentsService: InactiveParentsService,
              private currentAcademicYearService: CurrentAcademicYearService,
              private router: Router) {
    super();
    this.scrollHandle = this.scrollHandle.bind(this);
    this.initialBodyHeight = document.body.getBoundingClientRect().height;
    this.infiniteScrollTabIds = [
      'study_classes_at_risk',
      'inactive_parents'
    ];
    this.requestDataFunc = this.fetchData;

    this.generateStudyClassesAtRiskTable = this.generateStudyClassesAtRiskTable.bind(this);
    this.generateOwnStudentsAtRiskTable = this.generateOwnStudentsAtRiskTable.bind(this);
    this.generateOwnStudentsAverageTable = this.generateOwnStudentsAverageTable.bind(this);
    this.generateOwnStudentsAbsencesTable = this.generateOwnStudentsAbsencesTable.bind(this);
    this.generateOwnStudentsBehaviourGradeTable = this.generateOwnStudentsBehaviourGradeTable.bind(this);
    this.generateInactiveParentsTable = this.generateInactiveParentsTable.bind(this);
  }

  fetchTeacherInfo(initialQueryParams: string) {
    this.isTeacherClassMasterService.verifyIfClassMaster()
      .subscribe((response: boolean) => {
        this.isTeacherClassMaster = response;

        this.buildTabs();

        if (initialQueryParams) {
          this.onInitialQueryParamsChanges(initialQueryParams);
        } else {
          if (this.shouldDisplayNoDataMessage) {
            return;
          }

          this.activeTabTop = this.tabs_top[0].id;
          this.setBottomTabs();
          this.activeTabBottom = this.tabs_bottom[0].id;

          this.changeUrlParamsEvent.next({
            top_tab: this.activeTabTop,
            bottom_tab: this.activeTabBottom
          });
        }
      });
  }

  generateStudyClassesAtRiskTable() {
    this.studyClassesAtRiskTable = [];
    this.studyClassesAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'link-button',
      link: (value: StudyClassAtRisk) => {
        return `/my-classes/${value.id}/class-detail`;
      },
      minWidth: '150px'
    }));
    this.studyClassesAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '110px'
    }));
  }

  generateOwnStudentsAtRiskTable() {
    this.ownStudentsAtRiskTable = [];
    this.ownStudentsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal-fixed-max-width',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Medie generală anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      pivotPoint: 5,
      minWidth: '130px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe pe an',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: 3,
      minWidth: '150px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate pe an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
      minWidth: '240px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Notă anuală purtare',
      dataKey: this.isSecondSemesterEnded ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell',
      pivotPoint: 'behavior_grade_limit',
      minWidth: '115px'
    }));
  }

  generateOwnStudentsAverageTable() {
    this.ownStudentsAverageTable = [];
    this.ownStudentsAverageTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAverageTable.push(new Column({
      name: 'Medie generală anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '120px',
      pivotPoint: 5
    }));
  }

  generateOwnStudentsAbsencesTable() {
    this.ownStudentsAbsencesTable = [];
    this.ownStudentsAbsencesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAbsencesTable.push(new Column({
      name: 'Număr total absențe nemotivate pe an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit',
      minWidth: '240px',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11
    }));
  }

  generateOwnStudentsBehaviourGradeTable() {
    this.ownStudentsBehaviourGradeTable = [];
    this.ownStudentsBehaviourGradeTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsBehaviourGradeTable.push(new Column({
      name: 'Notă anuală purtare',
      dataKey: this.isSecondSemesterEnded ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell',
      pivotPoint: 'behavior_grade_limit',
      minWidth: '115px'
    }));
  }

  generateInactiveParentsTable() {
    this.inactiveParentsTable = [];
    this.inactiveParentsTable.push(new Column({
      backgroundColor: '#EDF0F5',
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

  ngOnInit(): void {
    window.setTimeout(() => this.generalChartView = handleChartWidthHeight(window.innerHeight, true), 500);
  }

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll', this.scrollHandle);
  }

  private buildTabs(): void {
    if (this.isFirstSemesterEnded) {

      if (this.isTeacherClassMaster) {
        this.tabs_top = [
          {id: 'my_classes', name: 'Clasele mele'},
          {id: 'class_mastery', name: 'Dirigenție'}
        ];

        this.tabs_bottom_my_classes = [
          {name: 'Top clase cu risc', id: 'study_classes_at_risk'}
        ];

        this.tabs_bottom_class_mastery = [
          {name: 'Top elevi cu risc', id: 'students_at_risk'},
          {name: 'Top elevi după medii', id: 'own_students_average'},
          {name: 'Top elevi după absențe', id: 'own_students_absences'},
          {name: 'Top elevi după notă purtare', id: 'own_students_behaviour_grade'},
          {name: 'Evoluție nr. elevi cu risc', id: 'own_students_risk_evolution'}
        ];
        if (!this.isSecondSemesterEnded) {
          this.tabs_bottom_class_mastery.push({name: 'Top părinți inactivi', id: 'inactive_parents'});
        }

      } else {
        this.tabs_top = [
          {id: 'my_classes', name: 'Clasele mele'}
        ];
        this.tabs_bottom_my_classes = [
          {name: 'Top clase cu risc', id: 'study_classes_at_risk'}
        ];
      }

    } else {
      if (this.isTeacherClassMaster) {
        this.tabs_top = [
          {id: 'class_mastery', name: 'Dirigenție'}
        ];

        this.tabs_bottom_class_mastery = [
          {name: 'Top elevi cu risc', id: 'students_at_risk'},
          {name: 'Evoluție nr. elevi cu risc', id: 'own_students_risk_evolution'},
          {name: 'Top părinți inactivi', id: 'inactive_parents'},
        ];

      } else {
        this.shouldDisplayNoDataMessage = true;
      }
    }
  }

  private setBottomTabs(): void {
    if (this.activeTabTop === 'my_classes') {
      this.tabs_bottom = this.tabs_bottom_my_classes;
    } else if (this.activeTabTop === 'class_mastery') {
      this.tabs_bottom = this.tabs_bottom_class_mastery;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialQueryParams && changes.initialQueryParams.currentValue !== changes.initialQueryParams.previousValue) {
      if (this.isTeacherClassMaster === undefined) {
        // First time on the page (either from the navigation menu, or from a report link from the home page
        // Can have or not query params
        this.initializePage(changes.initialQueryParams.currentValue);
      } else {
        // From tab change
        this.onInitialQueryParamsChanges(changes.initialQueryParams.currentValue);
      }
    }
  }

  private initializePage(initialQueryParams: string) {
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

      if (now > moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isFirstSemesterEnded = true;
      }
      if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isSecondSemesterEnded = true;
      }

      this.fetchTeacherInfo(initialQueryParams);
    });
  }

  private onInitialQueryParamsChanges(initialQueryParams: any) {
    if (this.shouldDisplayNoDataMessage) {
      this.router.navigateByUrl('').then();
      return;
    }

    const tab_ids = initialQueryParams.split('-');

    this.activeTabTop = tab_ids[0];
    if (findIndex(this.tabs_top, {id: this.activeTabTop}) < 0) {
      this.router.navigateByUrl('').then();
      return;
    }

    this.setBottomTabs();
    this.activeTabBottom = tab_ids[1];
    if (findIndex(this.tabs_bottom, {id: this.activeTabBottom}) < 0) {
      this.router.navigateByUrl('').then();
      return;
    }

    this.fetchData(this.activeTabTop, this.activeTabBottom);
  }

  emitUserIdForModal(event) {
    this.changeUserIdForModal.next(event);
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.generalChartView = handleChartWidthHeight(window.innerHeight, true);
  }

  addScrollListener(): void {
    this.chartHolderElement = document.getElementsByClassName('chart-holder')[0] as HTMLElement;
    document.body.addEventListener('scroll', removeChartTooltip);
    this.chartHolderElement.addEventListener('scroll', removeChartTooltip);
  }

  removeScrollListener(): void {
    document.body.removeEventListener('scroll', removeChartTooltip);
    this.chartHolderElement.removeEventListener('scroll', removeChartTooltip);
  }
}
