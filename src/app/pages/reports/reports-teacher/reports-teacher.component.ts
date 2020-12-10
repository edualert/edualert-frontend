import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  StudyClassesAtRiskService
} from '../../../services/statistics-services/school-statistics.service';
import {
  InactiveParentsService,
  OwnStudentsAbsencesService,
  OwnStudentsAtRiskService, OwnStudentsAverageService, OwnStudentsBehaviourGradesService,
  OwnStudentsRiskEvolutionService
} from '../../../services/statistics-services/students-statistics.service';
import {IsTeacherClassMasterService} from '../../../services/study-class.service';
import {Column} from '../../../shared/reports-table/reports-table.component';
import {StudentAtRisk} from '../../../models/student-data-list';
import {InactiveParent} from '../../../models/parent';
import * as moment from 'moment';
import {classMasterTabsMappingTypes, teacherTabs, notClassMasterTabsMappingTypes} from '../reports-tabs';
import {formatChartData, getCurrentMonthAsString, getCurrentYear, getDayOfTheWeek, handleChartWidthHeight, shouldDisplayChart} from '../../../shared/utils';

@Component({
  selector: 'app-reports-teacher',
  templateUrl: './reports-teacher.component.html',
  styleUrls: ['./reports-teacher.component.scss', '../reports.component.scss']
})
export class ReportsTeacherComponent implements OnInit, OnChanges {
  @Output() changeUrlParamsEvent = new EventEmitter<object>();
  @Output() changeUserIdForModal = new EventEmitter<string | number>();
  @Input() initialQueryParams: string;

  studyClassesAtRiskTable: Column[] = [];
  ownStudentsAtRiskTable: Column[] = [];
  ownStudentsAverageTable: Column[] = [];
  ownStudentsAbsencesTable: Column[] = [];
  ownStudentsBehaviourGradeTable: Column[] = [];
  inactiveParentsTable: Column[] = [];

  tabs_top: { name: string, id: teacherTabs }[] = [
    {name: 'Clasele mele', id: 'my_classes'},
    {name: 'Dirigenție', id: 'class_mastery'},
  ];
  tabs_bottom_my_classes: { name: string, id: teacherTabs }[] = [
    {name: 'Top clase cu risc', id: 'study_classes_at_risk'}
  ];
  tabs_bottom_class_mastery: { name: string, id: teacherTabs }[] = [
    {name: 'Top elevi cu risc', id: 'students_at_risk'},
    {name: 'Top elevi după medii', id: 'own_students_average'},
    {name: 'Top elevi după absențe', id: 'own_students_absences'},
    {name: 'Top elevi după notă purtare', id: 'own_students_behaviour_grade'},
    {name: 'Evoluție nr. elevi cu risc', id: 'own_students_risk_evolution'},
    {name: 'Top părinți inactivi', id: 'inactive_parents'},
  ];
  tabs_bottom: { name: string, id: string }[] = this.tabs_bottom_my_classes;
  activeTabTop: string = 'my_classes';
  activeTabBottom: string = 'study_classes_at_risk';
  month: number = moment().month();
  loading: boolean = false;

  data = {
    my_classes: {
      study_classes_at_risk: null
    },
    class_mastery: {
      students_at_risk: null,
      own_students_average: null,
      own_students_absences: null,
      own_students_behaviour_grade: null,
      own_students_risk_evolution: {
        0: null, 1: null, 2: null, 3: null, 4: null,
        5: null, 6: null, 7: null, 8: null, 9: null, 10: null, 11: null,
      },
      inactive_parents: null,
    },
  };
  isTeacherClassMaster: boolean;

  getDayOfTheWeek = getDayOfTheWeek;
  graphSubtitle: string;
  colorSchemeRed = {
    domain: ['#CC0033']
  };
  generalChartView: any[];
  displayChart: boolean;

  changeTab(event: any, type: string): void {
    if (type === 'top') {
      this.activeTabTop = event;
      switch (this.activeTabTop) {
        case 'my_classes':
          this.tabs_bottom = this.tabs_bottom_my_classes;
          this.activeTabBottom = this.tabs_bottom_my_classes[0].id;
          break;
        case 'class_mastery':
          this.tabs_bottom = this.tabs_bottom_class_mastery;
          this.activeTabBottom = this.tabs_bottom_class_mastery[0].id;
          break;
        default:
          this.tabs_bottom = this.tabs_bottom_my_classes;
          this.activeTabBottom = this.tabs_bottom_my_classes[0].id;
          break;
      }
    }
    if (type === 'bottom') {
      this.activeTabBottom = event;
    }
    this.changeUrlParamsEvent.next({
      top_tab: this.activeTabTop,
      bottom_tab: this.activeTabBottom
    });
    this.month = moment().month();
  }

  changeMonth(event: string): void {
    this.month = new Date(event).getMonth();
    this.fetchData(this.activeTabTop, this.activeTabBottom);
  }

  getPreviousCurrentAndNextMonth(month: number) {
    const mapping = {'-1': '12', 0: '1', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9', 9: '10', 10: '11', 11: '12', 12: '1'};
    return {
      current: mapping[month],
      prev: mapping[month - 1],
      next: mapping[month + 1],
    };
  }

  fetchData(id_top: string, id_bottom: string) {
    // If we already have data for that id don't make a request
    if (this.data[id_top] !== undefined && this.data[id_top][id_bottom] !== null && id_bottom !== 'own_students_risk_evolution') {
      return;
    }
    if (id_bottom === 'own_students_risk_evolution' && this.data[id_top][id_bottom][this.month - 1] && this.data[id_top][id_bottom][this.month]) {
      this.displayChart = shouldDisplayChart(this.data[id_top][id_bottom][this.month]['chartData'][0]['series']);
      return;
    }
    this.loading = true;

    const month = this.getPreviousCurrentAndNextMonth(this.month);

    const notClassMasterRequests = {
      'my_classes-study_classes_at_risk': {
        request: this.studyClassesAtRiskService.getData(false),
        generate: this.generateStudyClassesAtRiskTable
      }
    };

    const classMasterRequests = {
      'my_classes-study_classes_at_risk': {
        request: this.studyClassesAtRiskService.getData(false),
        generate: this.generateStudyClassesAtRiskTable
      },
      'class_mastery-students_at_risk': {
        request: this.ownStudentsAtRiskService.getData(false),
        generate: this.generateOwnStudentsAtRiskTable
      },
      'class_mastery-own_students_average': {
        request: this.ownStudentsAverageService.getData(false),
        generate: this.generateOwnStudentsAverageTable
      },
      'class_mastery-own_students_absences': {
        request: this.ownStudentsAbsencesService.getData(false),
        generate: this.generateOwnStudentsAbsencesTable
      },
      'class_mastery-own_students_behaviour_grade': {
        request: this.ownStudentsBehaviourGradeService.getData(false),
        generate: this.generateOwnStudentsBehaviourGradeTable
      },
      'class_mastery-own_students_risk_evolution': {
        request: this.ownStudentsEvolutionService.getData(true, '', '', month.current),
        requestPrevious: this.ownStudentsEvolutionService.getData(true, '', month.prev)
      },
      'class_mastery-inactive_parents': {
        request: this.inactiveParentsService.getData(false),
        generate: this.generateInactiveParentsTable
      },
    };
    let requests: { [tab in classMasterTabsMappingTypes]: any } | { [tab in notClassMasterTabsMappingTypes]: any };

    if (this.isTeacherClassMaster) {
      requests = {...classMasterRequests};
    } else {
      requests = {...notClassMasterRequests};
    }

    const req = requests[`${id_top}-${id_bottom}`];
    if (id_bottom === 'own_students_risk_evolution') {
      if (this.month === -10) {
        return;
      }
      req.request.subscribe((response) => {
        this.data[id_top][id_bottom][this.month] = formatChartData(response, 'Elevi', this.month);
        this.displayChart = shouldDisplayChart(response);
        this.loading = false;
      }, error => {
        this.data[id_top][id_bottom][this.month] = error.detail;
        this.loading = false;
      });
      req.requestPrevious.subscribe((response) => {
        this.data[id_top][id_bottom][this.month - 1] = formatChartData(response, 'Elevi', this.month);
        this.displayChart = shouldDisplayChart(response);
        this.loading = false;
      }, error => {
        this.data[id_top][id_bottom][this.month - 1] = error.detail;
        this.loading = false;
      });
      return;
    }

    req.request.subscribe((response) => {
      this.data[id_top][id_bottom] = response;
      this.loading = false;
      if (req.generate) {
        req.generate();
      }
    });

  }

  constructor(private isTeacherClassMasterService: IsTeacherClassMasterService,
              private studyClassesAtRiskService: StudyClassesAtRiskService,
              private ownStudentsEvolutionService: OwnStudentsRiskEvolutionService,
              private ownStudentsAverageService: OwnStudentsAverageService,
              private ownStudentsAbsencesService: OwnStudentsAbsencesService,
              private ownStudentsBehaviourGradeService: OwnStudentsBehaviourGradesService,
              private ownStudentsAtRiskService: OwnStudentsAtRiskService,
              private inactiveParentsService: InactiveParentsService,
  ) {
    this.generateStudyClassesAtRiskTable = this.generateStudyClassesAtRiskTable.bind(this);
    this.generateOwnStudentsAtRiskTable = this.generateOwnStudentsAtRiskTable.bind(this);
    this.generateOwnStudentsAverageTable = this.generateOwnStudentsAverageTable.bind(this);
    this.generateOwnStudentsAbsencesTable = this.generateOwnStudentsAbsencesTable.bind(this);
    this.generateOwnStudentsBehaviourGradeTable = this.generateOwnStudentsBehaviourGradeTable.bind(this);
    this.generateInactiveParentsTable = this.generateInactiveParentsTable.bind(this);
  }


  fetchTeacherInfo() {
    this.isTeacherClassMasterService.verifyIfClassMaster()
      .subscribe((response: boolean) => {
        this.isTeacherClassMaster = response;
        if (!response) {
          this.tabs_top = [
            {name: 'Clasele mele', id: 'my_classes'},
          ];
        }
        this.fetchData(this.activeTabTop, this.activeTabBottom);
      });
  }

  generateStudyClassesAtRiskTable() {
    this.studyClassesAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume clasă',
      dataKey: 'class_full_name',
      columnType: 'class-name',
      minWidth: '150px'
    }));
    this.studyClassesAtRiskTable.push(new Column({
      name: 'Număr elevi cu risc',
      dataKey: 'students_at_risk_count',
      columnType: 'numbered-cell',
      minWidth: '110px'
    }));
  }

  generateOwnStudentsAtRiskTable() {
    this.ownStudentsAtRiskTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Medie generală anuală',
      dataKey: this.data[this.activeTabTop][this.activeTabBottom][0]?.avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '130px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr corigențe pe an',
      dataKey: 'second_examinations_count',
      columnType: 'numbered-cell',
      minWidth: '150px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Număr total absențe nemotivate pe an',
      dataKey: this.data[this.activeTabTop][this.activeTabBottom][0]?.unfounded_abs_count_annual ? 'unfounded_abs_count_annual'
        : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell',
      minWidth: '240px'
    }));
    this.ownStudentsAtRiskTable.push(new Column({
      name: 'Notă anuală purtare',
      dataKey: this.data[this.activeTabTop][this.activeTabBottom][0]?.behavior_grade_annual ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell',
      minWidth: '115px'
    }));
  }

  generateOwnStudentsAverageTable() {
    this.ownStudentsAverageTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAverageTable.push(new Column({
      name: 'Medie generală anuală',
      dataKey: this.data[this.activeTabTop][this.activeTabBottom][0]?.avg_final ? 'avg_final' : 'avg_sem1',
      columnType: 'graded-cell',
      minWidth: '120px'
    }));
  }

  generateOwnStudentsAbsencesTable() {
    this.ownStudentsAbsencesTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsAbsencesTable.push(new Column({
      name: 'Număr total absențe nemotivate pe an',
      dataKey: this.data[this.activeTabTop][this.activeTabBottom][0]?.unfounded_abs_count_annual ? 'unfounded_abs_count_annual'
        : 'unfounded_abs_count_sem1',
      columnType: 'numbered-cell',
      minWidth: '240px'
    }));
  }

  generateOwnStudentsBehaviourGradeTable() {
    this.ownStudentsBehaviourGradeTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: StudentAtRisk) => {
        return value.student.id;
      },
      minWidth: '200px'
    }));
    this.ownStudentsBehaviourGradeTable.push(new Column({
      name: 'Notă anuală purtare',
      dataKey: this.data[this.activeTabTop][this.activeTabBottom][0]?.behavior_grade_annual ? 'behavior_grade_annual' : 'behavior_grade_sem1',
      columnType: 'graded-cell',
      minWidth: '115px'
    }));
  }

  generateInactiveParentsTable() {
    this.inactiveParentsTable.push(new Column({
      backgroundColor: '#EDF0F5',
      name: 'Nume părinte',
      dataKey: 'full_name',
      columnType: 'user-details-modal',
      link: (value: InactiveParent) => {
        return value.id;
      },
      minWidth: '200px'
    }));
    this.inactiveParentsTable.push(new Column({
      name: 'Nume elev',
      dataKey: 'student_full_name',
      columnType: 'user-details-modal',
      link: (value: InactiveParent) => {
        return value.children[0].id;
      },
      minWidth: '200px'
    }));
    this.inactiveParentsTable.push(new Column({
      name: 'Ultima dată activ',
      dataKey: 'last_online',
      displayFormatter: (value: string) => {
        return moment(value, 'DD-MM-YYYYThh:mm:ss').format('DD.MM.YYYY').toString();
      },
      minWidth: '100px'
    }));
  }

  ngOnInit(): void {
    this.changeUrlParamsEvent.next({
      top_tab: this.activeTabTop,
      bottom_tab: this.activeTabBottom
    });
    this.graphSubtitle = `${getCurrentMonthAsString()} ${getCurrentYear()}`;
    window.setTimeout(() => this.generalChartView = handleChartWidthHeight(window.innerHeight), 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialQueryParams && changes.initialQueryParams.currentValue !== changes.initialQueryParams.previousValue) {
      const tab_ids = changes.initialQueryParams.currentValue.split('-');
      this.activeTabTop = tab_ids[0];
      this.activeTabBottom = tab_ids[1];
      if (this.activeTabTop === 'my_classes') {
        this.tabs_bottom = this.tabs_bottom_my_classes;
      }
      if (this.activeTabTop === 'class_mastery') {
        this.tabs_bottom = this.tabs_bottom_class_mastery;
      }

      if (this.isTeacherClassMaster === undefined) {
        this.fetchTeacherInfo();
      } else {
        this.fetchData(this.activeTabTop, this.activeTabBottom);
      }
    }
  }

  emitUserIdForModal(event) {
    this.changeUserIdForModal.next(event);
  }

  @HostListener('window:resize', ['$event'])
  resizeChart(event) {
    this.generalChartView = handleChartWidthHeight(window.innerHeight);
  }

}
