import { Component, HostListener, Input, OnInit} from '@angular/core';
import {UserDetails} from '../../../models/user-details';
import {InactiveInstitutionsService, InstitutionsAtRiskService, InstitutionsEnrollmentStatisticsService} from '../../../services/statistics-services/institutions-statistics.service';
import {InactiveInstitution, InstitutionAtRisk} from '../../../models/institution';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';
import {StudentsRiskEvolutionService} from '../../../services/statistics-services/students-statistics.service';
import {Column} from '../../../shared/reports-table/reports-table.component';
import * as moment from 'moment';
import {findIndex} from 'lodash';

@Component({
  selector: 'app-home-ors',
  templateUrl: './home-ors.component.html',
  styleUrls: ['./home-ors.component.scss', '../home.component.scss'],
})
export class HomeOrsComponent implements OnInit {
  @Input() userDetails: UserDetails;
  graphSubtitle: string;
  getDayOfTheWeek = getDayOfTheWeek;

  institutionsAtRiskList: InstitutionAtRisk[];
  inactiveInstitutionList: InactiveInstitution[];

  institutionsAtRiskTableLayout: Column[] = [];
  inactiveInstitutionsTableLayout: Column[] = [];

  institutionsEnrollmentStatistics: any;
  institutionsChartView: any[];
  colorSchemeYellow = {
    domain: ['#FFB300']
  };
  xAxis: boolean = true;
  yAxis: boolean = true;
  displayChart: boolean;

  studentsRiskEvolutionStatistics: any;
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  studentsRiskChartView: any[];
  studentsRiskDisplayChart: boolean;

  constructor(private institutionsAtRiskService: InstitutionsAtRiskService,
              private institutionsEnrollmentService: InstitutionsEnrollmentStatisticsService,
              private studentsRiskEvolutionService: StudentsRiskEvolutionService,
              private inactiveInstitutionsService: InactiveInstitutionsService) {
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
  }

  ngOnInit(): void {
    this.fetchPageData();
    this.institutionsChartView = handleChartWidthHeight();
    this.studentsRiskChartView = handleChartWidthHeight();
  }

  fetchPageData(): void {
    this.institutionsAtRiskService.getData(false).subscribe(response => {
      this.institutionsAtRiskList = response;
      this.generateFirstTableLayout();
    });
    this.inactiveInstitutionsService.getData(false).subscribe(response => {
      this.inactiveInstitutionList = response;
      this.generateSecondTableLayout();
    });
    this.institutionsEnrollmentService.getData(true).subscribe(response => {
      this.displayChart = shouldDisplayChart(response);
      this.institutionsEnrollmentStatistics = formatChartData(response, 'Institutii', moment().month());
    });
    this.studentsRiskEvolutionService.getData(true).subscribe(response => {
      this.studentsRiskDisplayChart = shouldDisplayChart(response);
      this.studentsRiskEvolutionStatistics = formatChartData(response, 'Elevi', moment().month());
    });
  }

  generateFirstTableLayout(): void {
    this.institutionsAtRiskTableLayout.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume institutie',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '200'
    }));
    this.institutionsAtRiskTableLayout.push(new Column({
      name: 'Numar elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '120'
    }));
  }

  generateSecondTableLayout(): void {
    this.inactiveInstitutionsTableLayout.push(new Column({
      backgroundColor: '#FFFFFF',
      name: 'Nume institutie',
      dataKey: 'name',
      columnType: 'simple-cell',
      minWidth: '210',
    }));
    this.inactiveInstitutionsTableLayout.push(new Column({
      name: 'Data ultimei modificari',
      dataKey: 'last_change_in_catalog',
      minWidth: '130',
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

}
