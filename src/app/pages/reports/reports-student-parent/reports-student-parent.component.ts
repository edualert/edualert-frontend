import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import {
  MyOwnAbsencesEvolutionService,
  MyOwnSchoolActivityService,
  MyOwnStatisticsService, MyOwnSubjectsAtRiskService
} from '../../../services/statistics-services/my-own-statistics.service';
import { AccountService } from '../../../services/account.service';
import { UserDetails } from '../../../models/user-details';
import {
  ChildAbsencesEvolutionService, ChildSchoolActivityService,
  ChildStatisticsService, ChildSubjectsAtRiskService
} from '../../../services/statistics-services/child-statistics.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import { parentStudentTabs } from '../reports-tabs';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, removeChartTooltip, shouldDisplayChart } from '../../../shared/utils';
import { IdFullname } from '../../../models/id-fullname';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';
import { ChildStatistics } from '../../../models/child-statistics';

@Component({
  selector: 'app-reports-student-parent',
  templateUrl: './reports-student-parent.component.html',
  styleUrls: ['./reports-student-parent.component.scss', '../reports.component.scss']
})
export class ReportsStudentParentComponent implements OnInit, OnChanges, OnDestroy {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  @Input() initialQueryParams: string;

  tabs: { name: string, id: string }[] = [];

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
  initialSelectedChild: IdFullname;
  childStatistics: ChildStatistics;
  forceRequestOnTables: {}[] = [
    {student_school_activity: true},
    {student_subjects_at_risk: true},
    {student_absences_evolution: true},
    {student_statistics: true}
  ];

  activeTab: string;
  month: number = moment().month();

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  graphSubtitle: string;
  colorSchemeRedBlue = {
    domain: ['#CC0033', '#0077DB']
  };
  chartHolderElement: HTMLElement;
  generalChartView: any[];
  displayChart: boolean;
  reqSubscription: any;
  childSubscription: any;

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
              private accountService: AccountService,
              private router: Router,
              private currentAcademicYearService: CurrentAcademicYearService) {
    this.generateStudentActivityTable = this.generateStudentActivityTable.bind(this);
    this.generateStudentSubjectsAtRiskTable = this.generateStudentSubjectsAtRiskTable.bind(this);

    accountService.account.subscribe((account: UserDetails) => {
      this.userDetails = account;
      this.accountRole = account.user_role;
    });

    this.selectedChild = this.accountService.selectedChild.getValue();
    this.initialSelectedChild = this.selectedChild;
    this.childSubscription = this.accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
      if (this.activeTab) {
        this.fetchData(this.activeTab);
      }
    });
  }

  ngOnInit(): void {
    window.setTimeout(() => this.generalChartView = handleChartWidthHeight(window.innerHeight, true), 500);
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.month = moment().month();

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

      if (now > moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isFirstSemesterEnded = true;
        this.tabs = [
          {name: 'Istoric activitate școlară', id: 'student_school_activity'},
          {name: 'Top materii cu risc', id: 'student_subjects_at_risk'},
          {name: 'Evoluție număr absențe', id: 'student_absences_evolution'},
          {name: 'Statistici', id: 'student_statistics'},
        ];
      } else {
        this.tabs = [
          {name: 'Istoric activitate școlară', id: 'student_school_activity'},
          {name: 'Evoluție număr absențe', id: 'student_absences_evolution'},
          {name: 'Statistici', id: 'student_statistics'},
        ];
      }
      if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isSecondSemesterEnded = true;
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

    if (!this.loading) {
      if (this.activeTab === 'student_absences_evolution') {
        if (this.data[this.activeTab][this.month]) {
          this.setDisplayChart(this.activeTab);
        } else {
          this.fetchData(this.activeTab);
        }
      } else {
        if (!this.data[this.activeTab]) {
          this.fetchData(this.activeTab);
        }
      }
    }
  }

  ngOnDestroy(): void {
    ReportsStudentParentComponent.unsubscribe(this.childSubscription);
  }

  private setDisplayChart(activeTab: string) {
    this.displayChart = shouldDisplayChart(this.data[activeTab][this.month][1]['chartData'][0]['series'], 'unfounded_count') ||
      shouldDisplayChart(this.data[activeTab][this.month][0]['chartData'][0]['series'], 'founded_count');
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
    } else if (this.accountRole === 'PARENT') {
      this.fetchDataParent(id);
    }
  }

  fetchDataParent(id: string) {
    if (this.initialSelectedChild && this.selectedChild.id !== this.initialSelectedChild.id) {
      this.initialSelectedChild = this.selectedChild;
      this.myOwnSchoolActivityTable = [];
      this.myOwnSubjectsAtRiskTable = [];

      // clear the data regarding previous student
      this.data['student_school_activity'] = null;
      this.data['student_subjects_at_risk'] = null;
      this.data['student_absences_evolution'] = {
        0: null, 1: null, 2: null, 3: null, 4: null,
        5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
      };
      this.data['student_statistics'] = null;
      this.forceRequestOnTables['student_school_activity'] = true;
      this.forceRequestOnTables['student_subjects_at_risk'] = true;
      this.forceRequestOnTables['student_statistics'] = true;
    }

    // If we already have data for that id don't make a request
    if (this.loading || (id !== 'student_absences_evolution' && this.data[id] !== null)) {
      return;
    }

    const previousMonth = this.month === 0 ? 11 : this.month - 1;
    if (id === 'student_absences_evolution' && this.data.student_absences_evolution[previousMonth] && this.data.student_absences_evolution[this.month]) {
      this.setDisplayChart(id);
      return;
    }

    // Else we are going to get the data from api
    const childId = this.selectedChild ? (this.selectedChild.id as string) : this.userDetails.children[0].id.toString();
    const months_students = this.getPreviousCurrentAndNextMonth(this.month);

    const requests: { [tab in parentStudentTabs]: any } = {
      student_school_activity: {
        request: this.childSchoolActivityService.getData(this.forceRequestOnTables['student_school_activity'], childId),
        generate: this.generateStudentActivityTable
      },
      student_subjects_at_risk: {
        request: this.childSubjectsAtRiskService.getData(this.forceRequestOnTables['student_subjects_at_risk'] ? this.forceRequestOnTables['student_school_activity'] : true, childId),
        generate: this.generateStudentSubjectsAtRiskTable
      },
      student_absences_evolution: {
        request: this.ownChildAbsencesEvolutionService.getData(true, '', childId, months_students.current, true),
        requestPrevious: this.ownChildAbsencesEvolutionService.getData(true, '', childId, months_students.prev, true)
      },
      student_statistics: {
        request: this.childStatisticsService.getData(this.forceRequestOnTables['student_statistics'], childId)
      },
    };

    const req = requests[`${id}`];
    if (id === 'student_absences_evolution') {
      if (!this.data[id][this.month]) {
        this.loading = true;
        req.request.subscribe((response) => {
          const chartGraphs = [];
          chartGraphs.push(formatChartData(response, 'Nemotivate', 'unfounded_count'));
          chartGraphs.push(formatChartData(response, 'Motivate', 'founded_count'));
          this.data[id][this.month] = chartGraphs;
          this.loading = false;
          this.setDisplayChart(id);
        }, error => {
          this.data[id][this.month] = error.detail;
          this.loading = false;
        });
      } else {
        this.setDisplayChart(id);
      }

      if (previousMonth !== 7 && !this.data[id][previousMonth]) {
        this.loading = true;
        req.requestPrevious.subscribe((response) => {
          const chartGraphs = [];
          chartGraphs.push(formatChartData(response, 'Nemotivate', 'unfounded_count'));
          chartGraphs.push(formatChartData(response, 'Motivate', 'founded_count'));
          this.data[id][previousMonth] = chartGraphs;
          this.loading = false;
        }, error => {
          this.data[id][previousMonth] = error.detail;
          this.loading = false;
        });
      }
      return;
    }

    this.loading = true;
    this.reqSubscription = req.request.subscribe((response) => {
      this.data[id] = response;
      if (id === 'student_statistics') {
        this.childStatistics = response;
      }
      this.loading = false;
      this.forceRequestOnTables[id] = false;
      if (req.generate) {
        req.generate();
      }
      ReportsStudentParentComponent.unsubscribe(this.reqSubscription);
    });
  }

  fetchDataChild(id: string) {
    // If we already have data for that id don't make a request
    if (this.loading || (id !== 'student_absences_evolution' && this.data[id] !== null)) {
      return;
    }

    const previousMonth = this.month === 0 ? 11 : this.month - 1;
    if (id === 'student_absences_evolution' && this.data.student_absences_evolution[previousMonth] && this.data.student_absences_evolution[this.month]) {
      this.setDisplayChart(id);
      return;
    }
    // Else we are going to get the data from api
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
        request: this.myOwnAbsencesEvolutionService.getData(true, '', months_students.current, true),
        requestPrevious: this.myOwnAbsencesEvolutionService.getData(true, '', months_students.prev, true)
      },
      student_statistics: {
        request: this.myOwnStatisticsService.getData(false)
      },
    };

    const req = requests[`${id}`];
    if (id === 'student_absences_evolution') {
      if (!this.data[id][this.month]) {
        this.loading = true;
        req.request.subscribe((response) => {
          const chartGraphs = [];
          chartGraphs.push(formatChartData(response, 'Nemotivate', 'unfounded_count'));
          chartGraphs.push(formatChartData(response, 'Motivate', 'founded_count'));
          this.data[id][this.month] = chartGraphs;
          this.loading = false;
          this.setDisplayChart(id);
        }, error => {
          this.data[id][this.month] = error.detail;
          this.loading = false;
        });
      } else {
        this.setDisplayChart(id);
      }

      if (previousMonth !== 7 && !this.data[id][previousMonth]) {
        this.loading = true;
        req.requestPrevious.subscribe((response) => {
          const chartGraphs = [];
          chartGraphs.push(formatChartData(response, 'Nemotivate', 'unfounded_count'));
          chartGraphs.push(formatChartData(response, 'Motivate', 'founded_count'));
          this.data[id][previousMonth] = chartGraphs;
          this.loading = false;
        }, error => {
          this.data[id][previousMonth] = error.detail;
          this.loading = false;
        });
      }
      return;
    }

    this.loading = true;
    req.request.subscribe((response) => {
      this.data[id] = response;
      if (id === 'student_statistics') {
        this.childStatistics = response;
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
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM').toString();
      },
      minWidth: '25%'
    }));
    this.myOwnSchoolActivityTable.push(new Column({
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '50%'
    }));
    this.myOwnSchoolActivityTable.push(new Column({
      name: 'Activitate',
      dataKey: 'event',
      columnType: 'custom-text',
      minWidth: '25%'
    }));
  }

  generateStudentSubjectsAtRiskTable() {
    this.myOwnSubjectsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '200px'
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      pivotPoint: 'avg_limit',
      minWidth: '120px'
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Număr absențe nemotivate / an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit-with-third-of-hours',
      thirdOfHoursPivotPoint: this.isSecondSemesterEnded ? 'third_of_hours_count_annual' : 'third_of_hours_count_sem1',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
      minWidth: '240px'
    }));
  }

  // @HostListener('window:resize', ['$event'])
  // resizeChart(event) {
  //   this.generalChartView = handleChartWidthHeight(window.innerHeight, true);
  // }

  private static unsubscribe(subscription: any) {
    if (subscription) {
      subscription.unsubscribe();
    }
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
