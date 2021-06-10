import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import { UserDetails } from '../../../models/user-details';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, removeChartTooltip, shouldDisplayChart } from '../../../shared/utils';
import { ChildSchoolActivityService, ChildStatisticsService, ChildSubjectsAtRiskService, ChildAbsencesEvolutionService } from '../../../services/statistics-services/child-statistics.service';
import { ChildSchoolActivity, ChildStatistics, SubjectForChild } from '../../../models/child-statistics';
import { Column } from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import { AccountService } from '../../../services/account.service';
import { IdFullname } from '../../../models/id-fullname';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-parent',
  templateUrl: './home-parent.component.html',
  styleUrls: ['./home-parent.component.scss', '../home.component.scss']
})
export class HomeParentComponent implements OnInit, OnDestroy {
  @Input() userDetails: UserDetails;
  currentMonth = moment().month();

  graphSubtitle: string;

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  childStatistics: ChildStatistics;

  childSchoolActivity: ChildSchoolActivity[];
  childActivityTable: Column[] = [];

  childSubjectsAtRisk: SubjectForChild[];
  childSubjectsAtRiskTable: Column[] = [];

  childAbsencesList: any;
  childAbsencesChartView: any[];
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  xAxis: boolean = true;
  yAxis: boolean = true;
  displayChart: boolean;
  chartHolderElement: HTMLElement;
  account: UserDetails;
  selectedChild: IdFullname;

  private childSubscription: Subscription;

  constructor(private childStatisticsService: ChildStatisticsService,
              private ownChildAbsencesEvolutionService: ChildAbsencesEvolutionService,
              private childSchoolActivityService: ChildSchoolActivityService,
              private childSubjectsAtRiskService: ChildSubjectsAtRiskService,
              private accountService: AccountService,
              private currentAcademicYearService: CurrentAcademicYearService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

      if (now > moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isFirstSemesterEnded = true;
      }
      if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isSecondSemesterEnded = true;
      }
    });

    this.childAbsencesChartView = handleChartWidthHeight();
    this.account = this.accountService.account.getValue();

    this.selectedChild = this.accountService.selectedChild.getValue();
    this.childSubscription = this.accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
      this.fetchPageData();
    });
  }

  fetchPageData(): void {
    const childId = this.selectedChild ? (this.selectedChild.id as string) : this.userDetails.children[0].id.toString();
    this.childStatisticsService.getData(true, childId)
      .subscribe(response => {
        this.childStatistics = response;
      });
    this.childSchoolActivityService.getData(true, childId)
      .subscribe(response => {
        if (response.length > 10) {
          response = response.slice(0, 10);
        }
        this.childSchoolActivity = response;
        this.childActivityTable = [];
        this.generateChildActivityTable();
      });
    this.childSubjectsAtRiskService.getData(true, childId)
      .subscribe(response => {
        this.childSubjectsAtRisk = response;
        this.childSubjectsAtRiskTable = [];
        this.generateChildSubjectsAtRiskTable();
      });
    this.ownChildAbsencesEvolutionService.getData(true, '', childId, this.currentMonth + 1)
      .subscribe(response => {
        this.displayChart = shouldDisplayChart(response, 'total_count');
        this.childAbsencesList = formatChartData(response, 'Absențe', 'total_count');
      });
  }

  generateChildActivityTable(): void {
    this.childActivityTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Dată',
      dataKey: 'date',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM').toString();
      },
      minWidth: '25%'
    }));
    this.childActivityTable.push(new Column({
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '50%'
    }));
    this.childActivityTable.push(new Column({
      name: 'Activitate',
      dataKey: 'event',
      columnType: 'custom-text',
      minWidth: '25%'
    }));
  }

  generateChildSubjectsAtRiskTable(): void {
    this.childSubjectsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '40%'
    }));
    this.childSubjectsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      pivotPoint: 'avg_limit',
      minWidth: '30%'
    }));
    this.childSubjectsAtRiskTable.push(new Column({
      name: 'Număr absențe nemotivate / an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit-with-third-of-hours',
      thirdOfHoursPivotPoint: this.isSecondSemesterEnded ? 'third_of_hours_count_annual' : 'third_of_hours_count_sem1',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
      minWidth: '30%'
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.childAbsencesChartView = handleChartWidthHeight();
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

  ngOnDestroy() {
    this.childSubscription.unsubscribe();
  }
}
