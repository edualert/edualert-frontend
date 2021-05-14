import { Component, HostListener, Input, OnInit } from '@angular/core';
import { UserDetails } from '../../../models/user-details';
import { InactiveInstitutionsService, InstitutionsAtRiskService, InstitutionsEnrollmentStatisticsService } from '../../../services/statistics-services/institutions-statistics.service';
import { InactiveInstitution, InstitutionAtRisk } from '../../../models/institution';
import { formatChartData, getCurrentMonthAsString, getCurrentYear, handleChartWidthHeight, removeChartTooltip, shouldDisplayChart } from '../../../shared/utils';
import { StudentsRiskEvolutionService } from '../../../services/statistics-services/students-statistics.service';
import { Column } from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import { CurrentAcademicYearService } from '../../../services/current-academic-year.service';

@Component({
  selector: 'app-home-ors',
  templateUrl: './home-ors.component.html',
  styleUrls: ['./home-ors.component.scss', '../home.component.scss'],
})
export class HomeOrsComponent implements OnInit {
  @Input() userDetails: UserDetails;
  graphSubtitle: string;

  institutionsAtRiskList: InstitutionAtRisk[];
  inactiveInstitutionList: InactiveInstitution[];

  institutionsAtRiskTableLayout: Column[] = [];
  inactiveInstitutionsTableLayout: Column[] = [];

  institutionsEnrollmentStatistics: any;
  institutionsChartView: any[];

  forceRequest: boolean = true;

  colorSchemeYellow = {
    domain: ['#FFB300']
  };
  xAxis: boolean = true;
  yAxis: boolean = true;
  displayChart: boolean;

  chartHolderElement: HTMLElement;
  studentsRiskEvolutionStatistics: any;
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  studentsRiskChartView: any[];
  studentsRiskDisplayChart: boolean;

  isFirstSemesterEnded: boolean = false;
  isSecondSemesterEnded: boolean = false;

  constructor(private institutionsAtRiskService: InstitutionsAtRiskService,
              private institutionsEnrollmentService: InstitutionsEnrollmentStatisticsService,
              private studentsRiskEvolutionService: StudentsRiskEvolutionService,
              private inactiveInstitutionsService: InactiveInstitutionsService,
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

    this.fetchPageData();
    this.institutionsChartView = handleChartWidthHeight();
    this.studentsRiskChartView = handleChartWidthHeight();
    this.forceRequest = false;
  }

  fetchPageData(): void {
    this.institutionsAtRiskService.getData(this.forceRequest).subscribe(response => {
      this.institutionsAtRiskList = response;
      this.generateInstitutionsAtRiskTableLayout();
    });
    this.inactiveInstitutionsService.getData(this.forceRequest).subscribe(response => {
      this.inactiveInstitutionList = response;
      this.generateInactiveInstitutionsTableLayout();
    });
    this.institutionsEnrollmentService.getData(true).subscribe(response => {
      this.displayChart = shouldDisplayChart(response);
      this.institutionsEnrollmentStatistics = formatChartData(response, 'Instituții');
    });
    this.studentsRiskEvolutionService.getData(true).subscribe(response => {
      this.studentsRiskDisplayChart = shouldDisplayChart(response);
      this.studentsRiskEvolutionStatistics = formatChartData(response, 'Elevi');
    });
  }

  generateInstitutionsAtRiskTableLayout(): void {
    this.institutionsAtRiskTableLayout.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume instituție',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '200px'
    }));
    this.institutionsAtRiskTableLayout.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '120px'
    }));
  }

  generateInactiveInstitutionsTableLayout(): void {
    this.inactiveInstitutionsTableLayout.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume instituție',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '210px',
    }));
    this.inactiveInstitutionsTableLayout.push(new Column({
      name: 'Data ultimei modificări',
      dataKey: 'last_change_in_catalog',
      minWidth: '130px',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
    }));
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.institutionsChartView = handleChartWidthHeight();
    this.studentsRiskChartView = handleChartWidthHeight();
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
