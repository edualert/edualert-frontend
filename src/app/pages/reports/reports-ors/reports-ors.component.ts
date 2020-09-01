import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  InactiveInstitutionsService, InstitutionsAbsencesService,
  InstitutionsAtRiskService, InstitutionsAverageService,
  InstitutionsEnrollmentStatisticsService
} from '../../../services/statistics-services/institutions-statistics.service';
import {StudentsRiskEvolutionService} from '../../../services/statistics-services/students-statistics.service';
import {Column} from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import {orsTabs} from '../reports-tabs';
import {formatChartData, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {findIndex} from 'lodash';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-reports-ors',
  templateUrl: './reports-ors.component.html',
  styleUrls: ['./reports-ors.component.scss', '../reports.component.scss']
})
export class ReportsOrsComponent implements OnInit, OnChanges {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  graphSubtitle: string;
  findIndex = findIndex;
  @Input() initialQueryParams: string;

  institutionsAtRiskTable: Column[] = [];
  inactiveInstitutionsTable: Column[] = [];
  institutionsAveragesTable: Column[] = [];
  institutionsAbsencesTable: Column[] = [];

  getDayOfTheWeek = getDayOfTheWeek;
  colorSchemeYellow = {
    domain: ['#FFB300']
  };
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  generalChartView: any[];
  institutionsDisplayChart: boolean;
  studentsDisplayChart: boolean;

  tabs: { name: string, id: orsTabs }[] = [
    {name: 'Instituții înrolate', id: 'enrolled_institutions'},
    {name: 'Instituții cu risc', id: 'institutions_at_risk'},
    {name: 'Instituții inactive', id: 'inactive_institutions'},
    {name: 'Instituții după medii', id: 'institutions_average'},
    {name: 'Instituții după absențe', id: 'institutions_absences'},
    {name: 'Elevi cu risc', id: 'students_risk_evolution'}
  ];

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

  activeTab: orsTabs = 'enrolled_institutions';
  month_enrolled_institutions: number = moment().month();
  month_students_risk_evolution: number =  moment().month();
  loading: boolean = false;

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
    this.changeUrlParamsEvent.next({top_tab: this.activeTab});
  }

  constructor(private institutionsAtRiskService: InstitutionsAtRiskService,
              private institutionsEnrollmentService: InstitutionsEnrollmentStatisticsService,
              private studentsRiskEvolutionService: StudentsRiskEvolutionService,
              private inactiveInstitutionsService: InactiveInstitutionsService,
              private institutionsAverageService: InstitutionsAverageService,
              private institutionsAbsencesService: InstitutionsAbsencesService) {
    this.generateInstitutionsAtRiskTable = this.generateInstitutionsAtRiskTable.bind(this);
    this.generateInactiveInstitutionsTable = this.generateInactiveInstitutionsTable.bind(this);
    this.generateInstitutionsAveragesTable = this.generateInstitutionsAveragesTable.bind(this);
    this.generateInstitutionsAbsencesTable = this.generateInstitutionsAbsencesTable.bind(this);
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
    // if (this.data[this.data.map(el => {return el.id}).indexOf(id)].data !== null) return;
    this.loading = true;

    const months_enrolled = this.getPreviousCurrentAndNextMonth(this.month_enrolled_institutions);
    const months_students = this.getPreviousCurrentAndNextMonth(this.month_students_risk_evolution);

    const requests: { [tab in orsTabs]: any } = {
      enrolled_institutions: {
        request: months_enrolled.current ? this.institutionsEnrollmentService.getData(true, '', months_enrolled.current) : null,
        requestPrevious: months_enrolled.prev ? this.institutionsEnrollmentService.getData(true, '', months_enrolled.prev) : null
      },
      institutions_at_risk: {
        request: this.institutionsAtRiskService.getData(false),
        generate: this.generateInstitutionsAtRiskTable
      },
      inactive_institutions: {
        request: this.inactiveInstitutionsService.getData(false),
        generate: this.generateInactiveInstitutionsTable
      },
      institutions_average: {
        request: this.institutionsAverageService.getData(false),
        generate: this.generateInstitutionsAveragesTable
      },
      institutions_absences: {
        request: this.institutionsAbsencesService.getData(false),
        generate: this.generateInstitutionsAbsencesTable
      },
      students_risk_evolution: {
        request: this.studentsRiskEvolutionService.getData(true, '', months_students.current),
        requestPrevious: this.studentsRiskEvolutionService.getData(true, '', months_students.prev)
      },
    };

    const req = requests[`${id}`];
    const month = id === 'students_risk_evolution' ? this.month_students_risk_evolution : this.month_enrolled_institutions;
    if (month === -11) {
      return;
    }

    // If we already have data for that id don't make a request
    if (!['students_risk_evolution', 'enrolled_institutions'].includes(id)) {
      if (this.data[id] !== null) {
        return;
      }
    } else {
      if (id === 'students_risk_evolution' && this.data.students_risk_evolution[this.month_students_risk_evolution]) {
        this.studentsDisplayChart = shouldDisplayChart(this.data.students_risk_evolution[this.month_students_risk_evolution]['chartData'][0]['series']);
        if (!this.data.students_risk_evolution[this.month_students_risk_evolution - 1]) {
          this.getPreviousMonthData(req.requestPrevious, id, month);
        }
        return;
      }
      if (id === 'enrolled_institutions' && this.data.enrolled_institutions[this.month_enrolled_institutions]) {
        this.institutionsDisplayChart = shouldDisplayChart(this.data.enrolled_institutions[this.month_enrolled_institutions]['chartData'][0]['series']);
        if (!this.data.enrolled_institutions[this.month_enrolled_institutions - 1]) {
          this.getPreviousMonthData(req.requestPrevious, id, month);
        }
        return;
      }
    }

    if (!['students_risk_evolution', 'enrolled_institutions'].includes(id)) {
      const req = requests[`${id}`];
      req.request.subscribe((response) => {
        this.data[id] = response;
        this.loading = false;
        if (req.generate) {
          req.generate();
        }
      });
      return;
    }

    if (req.request && req.requestPrevious) {
      req.request.subscribe((response) => {
        if (id === 'students_risk_evolution') {
          this.data[id][month] = formatChartData(response, 'Elevi', this.month_students_risk_evolution);
          this.studentsDisplayChart = shouldDisplayChart(response);
        } else if (id === 'enrolled_institutions') {
          this.data[id][month] = formatChartData(response, 'Instituții', this.month_enrolled_institutions);
          this.institutionsDisplayChart = shouldDisplayChart(response);
        }
        this.loading = false;
      }, error => {
        this.data[id][month] = error.detail;
        this.loading = false;
      });
      this.getPreviousMonthData(req.requestPrevious, id, month);
    }
  }

  getPreviousMonthData(request: any, type: string, month: number): void {
    if (month !== 8) {
      request.subscribe((response) => {
        if (type === 'students_risk_evolution') {
          this.data[type][month - 1] = formatChartData(response, 'Elevi', this.month_students_risk_evolution - 1);
        } else if (type === 'enrolled_institutions') {
          this.data[type][month - 1] = formatChartData(response, 'Instituții', this.month_enrolled_institutions - 1);
        }
        this.loading = false;
      }, error => {
        this.data[type][month - 1] = error.detail;
        this.loading = false;
      });
    }
  }

  generateInstitutionsAtRiskTable() {
    this.institutionsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume institutie',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '220'
    }));
    this.institutionsAtRiskTable.push(new Column({
      name: 'Numar elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '120'
    }));
  }

  generateInactiveInstitutionsTable() {
    this.inactiveInstitutionsTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume institutie',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '230',
    }));
    this.inactiveInstitutionsTable.push(new Column({
      name: 'Data ultimei modificari',
      dataKey: 'last_change_in_catalog',
      minWidth: '130',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
    }));
  }

  generateInstitutionsAveragesTable() {
    this.institutionsAveragesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume institutie',
      dataKey: 'school_unit_name',
      columnType: 'simple-cell',
      minWidth: '230',
    }));
    this.institutionsAveragesTable.push(new Column({
      name: 'Medie anuală instituție de învățământ',
      dataKey: this.data[this.activeTab][0].avg_annual ? 'avg_annual' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '217',
    }));
  }

  generateInstitutionsAbsencesTable() {
    this.institutionsAbsencesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume institutie',
      dataKey: 'school_unit_name',
      columnType: 'simple-cell',
      minWidth: '230',
    }));
    this.institutionsAbsencesTable.push(new Column({
      name: 'Număr mediu absențe nemotivate pe elev pe an',
      dataKey: this.data[this.activeTab][0].unfounded_abs_avg_annual ? 'unfounded_abs_avg_annual' : 'unfounded_abs_avg_sem1',
      columnType: 'numbered-cell',
      minWidth: '275',
    }));
  }

  ngOnInit(): void {
    this.changeUrlParamsEvent.next({top_tab: this.activeTab});
    window.setTimeout(() => this.generalChartView = handleChartWidthHeight(window.innerHeight), 500);
    this.month_students_risk_evolution = moment().month();
    this.month_enrolled_institutions = moment().month();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialQueryParams && changes.initialQueryParams.currentValue !== changes.initialQueryParams.previousValue) {
      this.activeTab = changes.initialQueryParams.currentValue;
      this.fetchData(this.activeTab);
    }
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.generalChartView = handleChartWidthHeight(window.innerHeight);
  }

}
