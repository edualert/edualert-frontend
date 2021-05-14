import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import {
  InactiveInstitutionsService, InstitutionsAbsencesService,
  InstitutionsAtRiskService, InstitutionsAverageService,
  InstitutionsEnrollmentStatisticsService
} from '../../../services/statistics-services/institutions-statistics.service';
import { StudentsRiskEvolutionService } from '../../../services/statistics-services/students-statistics.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import { orsTabs } from '../reports-tabs';
import { formatChartData, handleChartWidthHeight, removeChartTooltip, shouldDisplayChart } from '../../../shared/utils';
import { ScrollableList } from '../../list-page/scrollable-list';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';


@Component({
  selector: 'app-reports-ors',
  templateUrl: './reports-ors.component.html',
  styleUrls: ['./reports-ors.component.scss', '../reports.component.scss']
})
export class ReportsOrsComponent extends ScrollableList implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  @Input() initialQueryParams: string;

  institutionsAtRiskTable: Column[] = [];
  inactiveInstitutionsTable: Column[] = [];
  institutionsAveragesTable: Column[] = [];
  institutionsAbsencesTable: Column[] = [];

  colorSchemeYellow = {
    domain: ['#FFB300']
  };
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  chartHolderElement: HTMLElement;
  generalChartView: any[];
  institutionsDisplayChart: boolean;
  studentsDisplayChart: boolean;

  tabs: { name: string, id: orsTabs }[] = [];
  activeTab: orsTabs;

  data = {
    enrolled_institutions: {
      0: null, 1: null, 2: null, 3: null, 4: null,
      5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
    },
    institutions_at_risk: null,
    inactive_institutions: null,
    institutions_average: null,
    institutions_absences: null,
    students_risk_evolution: {
      0: null, 1: null, 2: null, 3: null, 4: null,
      5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
    },
  };

  currentPages = {
    institutions_at_risk: 1,
    inactive_institutions: 1,
    institutions_average: 1,
    institutions_absences: 1
  };
  scrollPositions: {
    institutions_at_risk: 0,
    inactive_institutions: 0,
    institutions_average: 0,
    institutions_absences: 0
  };
  page_size: number = 50;
  small_page_size: number = 10;

  month_enrolled_institutions: number = moment().month();
  month_students_risk_evolution: number = moment().month();
  loading: boolean = false;
  tableIsGenerated: boolean = false;

  isSecondSemesterEnded: boolean = false;

  private readonly chartTitleHeight = 40;

  changeMonth(event: string, type: string): void {
    if (type === 'enrolled_institutions') {
      this.month_enrolled_institutions = new Date(event).getMonth();
    } else if (type === 'students_risk_evolution') {
      this.month_students_risk_evolution = new Date(event).getMonth();
    }
    this.fetchData(type);
  }

  changeTab(event: orsTabs): void {
    this.activeTab = event;
    if (!['students_risk_evolution', 'enrolled_institutions'].includes(event)) {
      if (this.data[this.activeTab] === null) {
        this.currentPages[this.activeTab] = 1;
      }
      this.page = this.currentPages[this.activeTab];
    }
    this.changeUrlParamsEvent.next({top_tab: this.activeTab});
    this.month_enrolled_institutions = moment().month();
    this.month_students_risk_evolution = moment().month();
  }

  constructor(private institutionsAtRiskService: InstitutionsAtRiskService,
              private institutionsEnrollmentService: InstitutionsEnrollmentStatisticsService,
              private studentsRiskEvolutionService: StudentsRiskEvolutionService,
              private inactiveInstitutionsService: InactiveInstitutionsService,
              private institutionsAverageService: InstitutionsAverageService,
              private institutionsAbsencesService: InstitutionsAbsencesService,
              private currentAcademicYearService: CurrentAcademicYearService,
              private router: Router) {
    super();
    this.generateInstitutionsAtRiskTable = this.generateInstitutionsAtRiskTable.bind(this);
    this.generateInactiveInstitutionsTable = this.generateInactiveInstitutionsTable.bind(this);
    this.generateInstitutionsAveragesTable = this.generateInstitutionsAveragesTable.bind(this);
    this.generateInstitutionsAbsencesTable = this.generateInstitutionsAbsencesTable.bind(this);

    this.scrollHandle = this.scrollHandle.bind(this);
    this.requestDataFunc = this.fetchData;
    this.initialBodyHeight = document.body.getBoundingClientRect().height;
  }

  getPreviousCurrentAndNextMonth(month: number) {
    const mapping = {'-1': '12', 0: '1', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9', 9: '10', 10: '11', 11: '12', 12: '1'};
    return {
      current: mapping[month],
      prev: mapping[month - 1],
      next: mapping[month + 1],
    };
  }

  fetchData(id: string) {
    this.loading = true;
    this.currentPages[this.activeTab] = this.page;

    this.tableIsGenerated = !(this.data[id] === null);
    if (this.data[id] === null) {
      this.tableIsGenerated = false;
      document.body.removeEventListener('scroll', this.scrollHandle);
      document.body.addEventListener('scroll', this.scrollHandle);
    }

    const months_enrolled = this.getPreviousCurrentAndNextMonth(this.month_enrolled_institutions);
    const months_students = this.getPreviousCurrentAndNextMonth(this.month_students_risk_evolution);

    const requests: { [tab in orsTabs]: any } = {
      enrolled_institutions: {
        request: months_enrolled.current ? this.institutionsEnrollmentService.getData(true, '', months_enrolled.current) : null,
        requestPrevious: months_enrolled.prev ? this.institutionsEnrollmentService.getData(true, '', months_enrolled.prev) : null
      },
      institutions_at_risk: {
        request: this.institutionsAtRiskService.getData(true, null, this.page_size, this.page),
        generate: this.generateInstitutionsAtRiskTable,
        getTotalCount: this.institutionsAtRiskService.getTotalCount
      },
      inactive_institutions: {
        request: this.inactiveInstitutionsService.getData(true, null, this.page_size, this.page),
        generate: this.generateInactiveInstitutionsTable,
        getTotalCount: this.inactiveInstitutionsService.getTotalCount
      },
      institutions_average: {
        request: this.institutionsAverageService.getData(true, null, this.small_page_size, this.page),
        generate: this.generateInstitutionsAveragesTable,
        getTotalCount: this.institutionsAverageService.getTotalCount
      },
      institutions_absences: {
        request: this.institutionsAbsencesService.getData(true, null, this.small_page_size, this.page),
        generate: this.generateInstitutionsAbsencesTable,
        getTotalCount: this.institutionsAbsencesService.getTotalCount
      },
      students_risk_evolution: {
        request: this.studentsRiskEvolutionService.getData(true, '', months_students.current),
        requestPrevious: this.studentsRiskEvolutionService.getData(true, '', months_students.prev)
      },
    };

    const req = requests[`${id}`];
    const month = id === 'students_risk_evolution' ? this.month_students_risk_evolution : this.month_enrolled_institutions;
    const previousMonth = month === 0 ? 11 : month - 1;

    // If we already have data for that id don't make a request
    if (!['students_risk_evolution', 'enrolled_institutions'].includes(id)) {
      if (this.data[id] !== null && (this.listEnded || this.totalCount === this.data[id].length)) {
        return;
      }
    } else {
      if (id === 'students_risk_evolution' && this.data.students_risk_evolution[month]) {
        this.studentsDisplayChart = shouldDisplayChart(this.data.students_risk_evolution[month]['chartData'][0]['series']);
        if (!this.data.students_risk_evolution[previousMonth]) {
          this.getPreviousMonthData(req.requestPrevious, id, previousMonth);
        }
        return;
      }
      if (id === 'enrolled_institutions' && this.data.enrolled_institutions[month]) {
        this.institutionsDisplayChart = shouldDisplayChart(this.data.enrolled_institutions[month]['chartData'][0]['series']);
        if (!this.data.enrolled_institutions[previousMonth]) {
          this.getPreviousMonthData(req.requestPrevious, id, previousMonth);
        }
        return;
      }
    }

    if (!['students_risk_evolution', 'enrolled_institutions'].includes(id)) {
      const req = requests[`${id}`];
      this.initialRequestInProgress = true;
      req.request.subscribe((response) => {
        if (this.data[id] === null) {
          this.data[id] = [];
        }
        response.map(result => this.data[id].push(result));
        this.totalCount = req.getTotalCount();
        this.elementCount = this.data[id]?.length;
        this.initialRequestInProgress = false;
        this.loading = false;

        if (req.generate && !this.tableIsGenerated) {
          req.generate();
          this.tableIsGenerated = true;
        }
      });
      return;
    }

    if (req.request && req.requestPrevious) {
      req.request.subscribe((response) => {
        if (id === 'students_risk_evolution') {
          this.data[id][month] = formatChartData(response, 'Elevi');
          this.studentsDisplayChart = shouldDisplayChart(response);
        } else if (id === 'enrolled_institutions') {
          this.data[id][month] = formatChartData(response, 'Instituții');
          this.institutionsDisplayChart = shouldDisplayChart(response);
        }
        this.loading = false;
      }, error => {
        this.data[id][month] = error.detail;
        this.loading = false;
      });
      this.getPreviousMonthData(req.requestPrevious, id, previousMonth);
    }
  }

  getPreviousMonthData(request: any, type: string, previousMonth: number): void {
    if (previousMonth !== 7) {
      request.subscribe((response) => {
        if (type === 'students_risk_evolution') {
          this.data[type][previousMonth] = formatChartData(response, 'Elevi');
        } else if (type === 'enrolled_institutions') {
          this.data[type][previousMonth] = formatChartData(response, 'Instituții');
        }
        this.loading = false;
      }, error => {
        this.data[type][previousMonth] = error.detail;
        this.loading = false;
      });
    }
  }

  generateInstitutionsAtRiskTable() {
    this.institutionsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume instituție',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '220px'
    }));
    this.institutionsAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '120px'
    }));
  }

  generateInactiveInstitutionsTable() {
    this.inactiveInstitutionsTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume instituție',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '230px',
    }));
    this.inactiveInstitutionsTable.push(new Column({
      name: 'Data ultimei modificări',
      dataKey: 'last_change_in_catalog',
      minWidth: '130px',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
    }));
  }

  generateInstitutionsAveragesTable() {
    this.institutionsAveragesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume instituție',
      dataKey: 'school_unit_name',
      columnType: 'simple-cell',
      minWidth: '230px',
    }));
    this.institutionsAveragesTable.push(new Column({
      name: 'Medie anuală instituție de învățământ',
      dataKey: this.isSecondSemesterEnded ? 'avg_annual' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '217px',
      pivotPoint: 5
    }));
  }

  generateInstitutionsAbsencesTable() {
    this.institutionsAbsencesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume instituție',
      dataKey: 'school_unit_name',
      columnType: 'simple-cell',
      minWidth: '230px',
    }));
    this.institutionsAbsencesTable.push(new Column({
      name: 'Număr mediu absențe nemotivate pe elev pe an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_avg_annual' : 'unfounded_abs_avg_sem1',
      columnType: 'numbered-cell',
      minWidth: '275px',
    }));
  }

  ngOnInit(): void {
    this.isOnReportsPage = true;

    window.setTimeout(() =>
        this.generalChartView = handleChartWidthHeight(window.innerHeight - this.chartTitleHeight, true, true),
      500);
    this.month_students_risk_evolution = moment().month();
    this.month_enrolled_institutions = moment().month();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialQueryParams && changes.initialQueryParams.currentValue !== changes.initialQueryParams.previousValue) {
      if (!this.tabs.length) {
        this.initializePage(changes.initialQueryParams.currentValue);
      } else {
        this.onInitialQueryParamsChanges(changes.initialQueryParams.currentValue);
      }
    }
  }

  private initializePage(tabId: any) {
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

      if (now <= moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.tabs = [
          {name: 'Instituții înrolate', id: 'enrolled_institutions'},
          {name: 'Instituții inactive', id: 'inactive_institutions'},
          {name: 'Elevi cu risc', id: 'students_risk_evolution'}
        ];
      } else {
        this.tabs = [
          {name: 'Instituții înrolate', id: 'enrolled_institutions'},
          {name: 'Instituții cu risc', id: 'institutions_at_risk'},
          {name: 'Instituții inactive', id: 'inactive_institutions'},
          {name: 'Instituții după medii', id: 'institutions_average'},
          {name: 'Instituții după absențe', id: 'institutions_absences'},
          {name: 'Elevi cu risc', id: 'students_risk_evolution'}
        ];
        if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
          this.tabs.splice(this.tabs.findIndex(item => item.id === 'inactive_institutions'), 1);
          this.isSecondSemesterEnded = true;
        }
      }

      this.onInitialQueryParamsChanges(tabId);
    });
  }

  private onInitialQueryParamsChanges(tabId: any) {
    if (this.tabs.findIndex(item => item.id === tabId) < 0) {
      this.router.navigateByUrl('').then();
      return;
    }

    this.activeTab = tabId;
    this.changeUrlParamsEvent.next({top_tab: this.activeTab});
    document.body.scrollTo(0, this.scrollPositions[this.activeTab]);

    if (!['students_risk_evolution', 'enrolled_institutions'].includes(this.activeTab)) {
      this.elementCount = this.data[this.activeTab]?.length;
      if (this.currentPages[this.activeTab] === 1 && this.data[this.activeTab] === null) {
        this.fetchData(this.activeTab);
      }
    } else {
      this.fetchData(this.activeTab);
    }
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.generalChartView = handleChartWidthHeight(window.innerHeight - this.chartTitleHeight, true, true);
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

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll', this.scrollHandle);
  }

}
