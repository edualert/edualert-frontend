import { Component, HostListener, Input, OnInit } from '@angular/core';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, shouldDisplayChart } from '../../../shared/utils';
import { UserDetails } from '../../../models/user-details';
import { MyOwnAbsencesEvolutionService, MyOwnSchoolActivityService, MyOwnStatisticsService, MyOwnSubjectsAtRiskService } from '../../../services/statistics-services/my-own-statistics.service';
import { ChildSchoolActivity, ChildStatistics, SubjectForChild } from '../../../models/child-statistics';
import { Column } from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';

@Component({
  selector: 'app-home-student',
  templateUrl: './home-student.component.html',
  styleUrls: ['./home-student.component.scss', '../home.component.scss']
})
export class HomeStudentComponent implements OnInit {
  @Input() userDetails: UserDetails;
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
    this.currentAcademicYearService.getData().subscribe(response => {
      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();

      if (now >  moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isFirstSemesterEnded = true;
      }
      if (now > moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.isSecondSemesterEnded = true;
      }

      this.myOwnAbsencesView = handleChartWidthHeight();
      this.fetchPageData();
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
        if (response.length > 10) {
          response = response.slice(0, 10);
        }
        this.myOwnSchoolActivity = response;
        this.generateMyActivityTable();
      });
    this.myOwnSubjectsAtRiskService.getData(this.forceRequest)
      .subscribe(response => {
        this.myOwnSubjectsAtRisk = response;
        this.generateMyOwnSubjectsAtRiskTable();
      });
    this.myOwnAbsencesEvolutionService.getData(true, '', this.currentMonth + 1)
      .subscribe(response => {
        this.displayChart = shouldDisplayChart(response, 'total_count');
        this.myOwnAbsencesList = formatChartData(response, 'Absențe', 'total_count');
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
      dataKey: this.isSecondSemesterEnded ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell-dynamic-limit',
      pivotPoint: 'avg_limit',
      minWidth: '120px',
    }));
    this.myOwnSubjectsAtRiskTable.push(new Column({
      name: 'Număr absențe nemotivate / an',
      dataKey: this.isSecondSemesterEnded ? 'unfounded_abs_count_annual' : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell-dynamic-limit-with-third-of-hours',
      thirdOfHoursPivotPoint: this.isSecondSemesterEnded ? 'third_of_hours_count_annual' : 'third_of_hours_count_sem1',
      pivotPoint: this.isSecondSemesterEnded ? 22 : 11,
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
