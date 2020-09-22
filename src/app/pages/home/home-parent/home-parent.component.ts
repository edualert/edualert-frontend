import {Component, HostListener, Input, OnInit} from '@angular/core';
import {UserDetails} from '../../../models/user-details';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {ChildSchoolActivityService, ChildStatisticsService, ChildSubjectsAtRiskService, ChildAbsencesEvolutionService} from '../../../services/statistics-services/child-statistics.service';
import {ChildSchoolActivity, ChildStatistics, SubjectForChild} from '../../../models/child-statistics';
import {Column} from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import {findIndex} from 'lodash';
import {AccountService} from '../../../services/account.service';
import {IdFullname} from '../../../models/id-fullname';

@Component({
  selector: 'app-home-parent',
  templateUrl: './home-parent.component.html',
  styleUrls: ['./home-parent.component.scss', '../home.component.scss']
})
export class HomeParentComponent implements OnInit {

  @Input() userDetails: UserDetails;
  getDayOfTheWeek = getDayOfTheWeek;
  currentMonth = moment().month();
  graphSubtitle: string;

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
  account: UserDetails;
  selectedChild: IdFullname;


  constructor(private childStatisticsService: ChildStatisticsService,
              private ownChildAbsencesEvolutionService: ChildAbsencesEvolutionService,
              private childSchoolActivityService: ChildSchoolActivityService,
              private childSubjectsAtRiskService: ChildSubjectsAtRiskService,
              private accountService: AccountService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.fetchPageData();
    this.childAbsencesChartView = handleChartWidthHeight();
    this.account = this.accountService.account.getValue();

    this.selectedChild = this.accountService.selectedChild.getValue();
    this.accountService.selectedChild.subscribe((child: IdFullname) => {
      this.selectedChild = child;
      this.fetchPageData();
    });
  }

  fetchPageData(): void {
    const childId = this.selectedChild ? (this.selectedChild.id as string) : this.userDetails.children[0].id.toString();
    this.childStatisticsService.getData(false, childId)
      .subscribe(response => this.childStatistics = response);
    this.childSchoolActivityService.getData(false, childId)
      .subscribe(response => {
        this.childSchoolActivity = response;
        this.generateChildActivityTable();
      });
    this.childSubjectsAtRiskService.getData(false, childId)
      .subscribe(response => {
        this.childSubjectsAtRisk = response;
        this.generateChildSubjectsAtRiskTable();
      });
    this.ownChildAbsencesEvolutionService.getData(true, '', childId, this.currentMonth)
      .subscribe(response => {
        this.displayChart = shouldDisplayChart(response);
        this.childAbsencesList = formatChartData(response, 'Absențe', this.currentMonth);
      });
  }

  generateChildActivityTable(): void {
    this.childActivityTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Dată',
      dataKey: 'date',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '80'
    }));
    this.childActivityTable.push(new Column({
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '100'
    }));
    this.childActivityTable.push(new Column({
      name: 'Activitate',
      dataKey: 'event',
      columnType: 'custom-text',
      minWidth: '160'
    }));
  }

  generateChildSubjectsAtRiskTable(): void {
    this.childSubjectsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '150'
    }));
    this.childSubjectsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      data: this.childSubjectsAtRisk[0]?.avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'simple-cell',
      minWidth: '120'
    }));
    this.childSubjectsAtRiskTable.push(new Column({
      name: 'Număr absențe nemotivate / an',
      dataKey: this.childSubjectsAtRisk[0]?.unfounded_abs_count_annual ? 'unfounded_abs_count_annual'
        : 'unfounded_abs_count_sem1',
      columnType: 'graded-cell',
      minWidth: '240'
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.childAbsencesChartView = handleChartWidthHeight();
  }

}
