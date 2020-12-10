import {Component, HostListener, Input, OnInit} from '@angular/core';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {UserDetails} from '../../../models/user-details';
import {MyOwnAbsencesEvolutionService, MyOwnSchoolActivityService, MyOwnStatisticsService, MyOwnSubjectsAtRiskService} from '../../../services/statistics-services/my-own-statistics.service';
import {ChildSchoolActivity, ChildStatistics, SubjectForChild} from '../../../models/child-statistics';
import {Column} from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import {findIndex} from 'lodash';
import {CurrentAcademicYearService} from '../../../services/current-academic-year.service';

@Component({
  selector: 'app-home-student',
  templateUrl: './home-student.component.html',
  styleUrls: ['./home-student.component.scss', '../home.component.scss']
})
export class HomeStudentComponent implements OnInit {

  @Input() userDetails: UserDetails;
  getDayOfTheWeek = getDayOfTheWeek;
  graphSubtitle: string;
  currentMonth = moment().month();

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  myOwnStatistics: ChildStatistics;

  myOwnSchoolActivity: ChildSchoolActivity[];
  myOwnSchoolActivityTable: Column[] = [];

  myOwnSubjectsAtRisk: SubjectForChild[];
  myOwnSubjectsAtRiskTable: Column[] = [];

  forceRequest: boolean = true;

  myOwnAbsencesList: any;
  myOwnAbsencesView: any[];
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  xAxis: boolean = true;
  yAxis: boolean = true;
  displayChart: boolean;

  constructor(private myOwnStatisticsService: MyOwnStatisticsService,
              private myOwnSchoolActivityService: MyOwnSchoolActivityService,
              private myOwnSubjectsAtRiskService: MyOwnSubjectsAtRiskService,
              private myOwnAbsencesEvolutionService: MyOwnAbsencesEvolutionService,
              private currentAcademicYearService: CurrentAcademicYearService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.fetchPageData();
    this.myOwnAbsencesView = handleChartWidthHeight();

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
    });

    this.forceRequest = false;
  }

  fetchPageData(): void {
    this.myOwnStatisticsService.getData(this.forceRequest)
      .subscribe(response => {
        this.myOwnStatistics = response;
      });
    this.myOwnSchoolActivityService.getData(this.forceRequest)
      .subscribe(response => {
        this.myOwnSchoolActivity = response;
        this.generateMyActivityTable();
      });
    this.myOwnSubjectsAtRiskService.getData(this.forceRequest)
      .subscribe(response => {
        this.myOwnSubjectsAtRisk = response;
        this.generateMyOwnSubjectsAtRiskTable();
      });
    this.myOwnAbsencesEvolutionService.getData(true, '', this.currentMonth)
      .subscribe(response => {
        this.displayChart = shouldDisplayChart(response);
        this.myOwnAbsencesList = formatChartData(response, 'Absente', this.currentMonth);
      });
  }

  generateMyActivityTable(): void {
    this.myOwnSchoolActivityTable.push(new Column({
      backgroundColor: '#FFFFFF',
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

  generateMyOwnSubjectsAtRiskTable(): void {
    this.myOwnSubjectsAtRiskTable.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume materie',
      dataKey: 'subject_name',
      columnType: 'simple-cell',
      minWidth: '150px'
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Medie anuală',
      data: this.myOwnSubjectsAtRisk[0]?.avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'simple-cell',
      minWidth: '120px',
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Număr absențe nemotivate / an',
      dataKey: this.myOwnSubjectsAtRisk[0]?.unfounded_abs_count_annual ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'graded-cell',
      minWidth: '240px'
    }));
    if (!Column.checkSumOfWidths(this.myOwnSubjectsAtRiskTable)) {

    }
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.myOwnAbsencesView = handleChartWidthHeight();
  }

}
