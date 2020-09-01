import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  MyOwnAbsencesEvolutionService,
  MyOwnSchoolActivityService,
  MyOwnStatisticsService, MyOwnSubjectsAtRiskService
} from '../../../services/statistics-services/my-own-statistics.service';
import {AccountService} from '../../../services/account.service';
import {UserDetails} from '../../../models/user-details';
import {
  ChildAbsencesEvolutionService, ChildSchoolActivityService,
  ChildStatisticsService, ChildSubjectsAtRiskService
} from '../../../services/statistics-services/child-statistics.service';
import {Column} from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import {parentStudentTabs} from '../reports-tabs';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {IdFullname} from '../../../models/id-fullname';

@Component({
  selector: 'app-reports-student-parent',
  templateUrl: './reports-student-parent.component.html',
  styleUrls: ['./reports-student-parent.component.scss', '../reports.component.scss']
})
export class ReportsStudentParentComponent implements OnInit, OnChanges {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  @Input() initialQueryParams: string;

  tabs: { name: string, id: string }[] = [
    {name: 'Istoric activitate școlară', id: 'student_school_activity'},
    {name: 'Top materii cu risc', id: 'student_subjects_at_risk'},
    {name: 'Evoluție număr absențe', id: 'student_absences_evolution'},
    {name: 'Statistici', id: 'student_statistics'},
  ];

  data = {
    student_school_activity: null,
    student_subjects_at_risk: null,
    student_absences_evolution: {
      0: null, 1: null, 2: null, 3: null, 4: null,
      5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
    },
    student_statistics: null,
  };
  loading: boolean = false;
  userDetails: UserDetails;
  accountRole: string;
  selectedChild: IdFullname;

  activeTab = 'student_school_activity';
  month: number = moment().month();

  getDayOfTheWeek = getDayOfTheWeek;
  graphSubtitle: string;
  colorSchemeRedBlue = {
    domain: ['#CC0033', '#0077DB']
  };
  generalChartView: any[];
  displayChart: boolean;

  myOwnSchoolActivityTable: Column[] = [];
  myOwnSubjectsAtRiskTable: Column[] = [];

  constructor(private myOwnStatisticsService: MyOwnStatisticsService,
              private myOwnSchoolActivityService: MyOwnSchoolActivityService,
              private myOwnSubjectsAtRiskService: MyOwnSubjectsAtRiskService,
              private myOwnAbsencesEvolutionService: MyOwnAbsencesEvolutionService,
              private childStatisticsService: ChildStatisticsService,
              private ownChildAbsencesEvolutionService: ChildAbsencesEvolutionService,
              private childSchoolActivityService: ChildSchoolActivityService,
              private childSubjectsAtRiskService: ChildSubjectsAtRiskService,
              private accountService: AccountService) {
    this.generateStudentActivityTable = this.generateStudentActivityTable.bind(this);
    this.generateStudentSubjectsAtRiskTable = this.generateStudentSubjectsAtRiskTable.bind(this);

    accountService.account.subscribe((account: UserDetails) => {
      this.userDetails = account;
      this.accountRole = account.user_role;
    });

    this.selectedChild = this.accountService.selectedChild.getValue();
    this.accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
      this.fetchData(this.activeTab);
    });
  }

  changeTab(event: any) {
    this.activeTab = event;
    this.changeUrlParamsEvent.next({top_tab: this.activeTab});
  }

  changeMonth(event: string) {
    this.month = new Date(event).getMonth();
    this.fetchData(this.activeTab);
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
    if (this.accountRole === 'STUDENT') {
      this.fetchDataChild(id);
    }
    if (this.accountRole === 'PARENT') {
      this.fetchDataParent(id);
    }
  }

  fetchDataParent(id: string) {
    // If we already have data for that id don't make a request
    if (this.data[id] !== null && id !== 'student_absences_evolution') {
      return;
    }
    if (id === 'student_absences_evolution' && this.data.student_absences_evolution[this.month - 1] && this.data.student_absences_evolution[this.month]) {
      this.displayChart = shouldDisplayChart(this.data.student_absences_evolution[this.month]['chartData'][0]['series']);
      return;
    }

    // Else we are going to get the data from api
    this.loading = true;
    const childId = this.selectedChild ? (this.selectedChild.id as string) : this.userDetails.children[0].id.toString();

    const months_students = this.getPreviousCurrentAndNextMonth(this.month);

    const requests: { [tab in parentStudentTabs]: any } = {
      student_school_activity: {
        request: this.childSchoolActivityService.getData(false, childId),
        generate: this.generateStudentActivityTable
      },
      student_subjects_at_risk: {
        request: this.childSubjectsAtRiskService.getData(false, childId),
        generate: this.generateStudentSubjectsAtRiskTable
      },
      student_absences_evolution: {
        request: this.ownChildAbsencesEvolutionService.getData(true, '', childId, months_students.current),
        requestPrevious: this.ownChildAbsencesEvolutionService.getData(true, '', childId, months_students.prev)
      },
      student_statistics: {
        request: this.childStatisticsService.getData(false, childId)
      },
    };

    if (id === 'student_absences_evolution') {
      const req = requests[`${id}`];
      if (this.month === -10) {
        return;
      }
      req.request.subscribe((response) => {
        const chartGraphs = [];
        chartGraphs.push(formatChartData(response, 'Motivate', moment().month(), 'founded_count'));
        chartGraphs.push(formatChartData(response, 'Nemotivate', moment().month(), 'unfounded_count'));
        this.data[id][this.month] = chartGraphs;
        this.loading = false;
      }, error => {
        this.data[id][this.month] = error.detail;
        this.loading = false;
      });
      req.requestPrevious.subscribe((response) => {
        const chartGraphs = [];
        chartGraphs.push(formatChartData(response, 'Motivate', moment().month(), 'founded_count'));
        chartGraphs.push(formatChartData(response, 'Nemotivate', moment().month(), 'unfounded_count'));
        this.data[id][this.month] = chartGraphs;
        this.loading = false;
      }, error => {
        this.data[id][this.month - 1] = error.detail;
        this.loading = false;
      });
      return;
    }

    const req = requests[`${id}`];
    req.request.subscribe((response) => {
      if (id === 'student_absences_evolution') {
        const chartGraphs = [];
        chartGraphs.push(formatChartData(response, 'Elevi', moment().month(), 'founded_count'));
        chartGraphs.push(formatChartData(response, 'Elevi', moment().month(), 'unfounded_count'));
        this.data[id][this.month] = chartGraphs;
        this.displayChart = shouldDisplayChart(response);
      } else {
        this.data[id] = response;
      }
      this.loading = false;
      if (req.generate) {
        req.generate();
      }
    });
  }

  fetchDataChild(id: string) {
    // If we already have data for that id don't make a request
    if (this.data[id] !== null && id !== 'student_absences_evolution') {
      return;
    }
    if (id === 'student_absences_evolution' && this.data.student_absences_evolution[this.month - 1] && this.data.student_absences_evolution[this.month + 1]) {
      this.displayChart = shouldDisplayChart(this.data.student_absences_evolution[this.month]['chartData'][0]['series']);
      return;
    }
    // Else we are going to get the data from api
    this.loading = true;
    const months_students = this.getPreviousCurrentAndNextMonth(this.month);

    const requests: { [tab in parentStudentTabs]: any } = {
      student_school_activity: {
        request: this.myOwnSchoolActivityService.getData(false),
        generate: this.generateStudentActivityTable
      },
      student_subjects_at_risk: {
        request: this.myOwnSubjectsAtRiskService.getData(false),
        generate: this.generateStudentSubjectsAtRiskTable
      },
      student_absences_evolution: {
        request: this.myOwnAbsencesEvolutionService.getData(false, '', months_students.current),
        requestPrevious: this.myOwnAbsencesEvolutionService.getData(false, '', months_students.prev)
      },
      student_statistics: {
        request: this.myOwnStatisticsService.getData(false)
      },
    };

    if (id === 'student_absences_evolution') {
      const req = requests[`${id}`];
      if (this.month === -10) {
        return;
      }
      req.request.subscribe((response) => {
        const chartGraphs = [];
        chartGraphs.push(formatChartData(response, 'Motivate', moment().month(), 'founded_count'));
        chartGraphs.push(formatChartData(response, 'Nemotivate', moment().month(), 'unfounded_count'));
        this.data[id][this.month] = chartGraphs;
        this.loading = false;
      }, error => {
        this.data[id][this.month] = error.detail;
        this.loading = false;
      });
      req.requestPrevious.subscribe((response) => {
        const chartGraphs = [];
        chartGraphs.push(formatChartData(response, 'Motivate', moment().month(), 'founded_count'));
        chartGraphs.push(formatChartData(response, 'Nemotivate', moment().month(), 'unfounded_count'));
        this.data[id][this.month] = chartGraphs;
        this.loading = false;
      }, error => {
        this.data[id][this.month - 1] = error.detail;
        this.loading = false;
      });
      return;
    }

    const req = requests[`${id}`];
    req.request.subscribe((response) => {
      if (id === 'student_absences_evolution') {
        const chartGraphs = [];
        chartGraphs.push(formatChartData(response, 'Motivate', moment().month(), 'founded_count'));
        chartGraphs.push(formatChartData(response, 'Nemotivate', moment().month(), 'unfounded_count'));
        this.data[id][this.month] = chartGraphs;
        this.displayChart = shouldDisplayChart(response);
      } else {
        this.data[id] = response;
      }
      this.loading = false;
      if (req.generate) {
        req.generate();
      }
    });
  }

  generateStudentActivityTable() {
    this.myOwnSchoolActivityTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Dată',
      dataKey: 'date',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '80'
    }));
    this.myOwnSchoolActivityTable.push(new Column({
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '100'
    }));
    this.myOwnSchoolActivityTable.push(new Column({
      name: 'Activitate',
      dataKey: 'event',
      columnType: 'custom-text',
      minWidth: '160'
    }));
  }

  generateStudentSubjectsAtRiskTable() {
    this.myOwnSubjectsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '200'
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      data: this.data[this.activeTab][0]?.avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '120'
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Număr absențe nemotivate / an',
      dataKey: this.data[this.activeTab][0]?.unfounded_abs_count_annual ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell',
      minWidth: '240'
    }));
  }

  ngOnInit(): void {
    this.changeUrlParamsEvent.next({top_tab: this.activeTab});
    window.setTimeout(() => this.generalChartView = handleChartWidthHeight(window.innerHeight), 500);
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
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
