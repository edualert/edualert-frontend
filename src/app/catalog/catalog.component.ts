import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from '@angular/core';
import {
  classPupils,
  classMastery,
  ownClassSubject,
  CatalogLayout,
  CellIdentifier,
  studentCatalog,
  studentsSituationOrs,
  studentsSituationTeacherPrincipal,
  studentOwnSituation
} from '../models/catalog-layouts';
import {cloneDeep} from 'lodash';
import {AcademicYearCalendarService} from '../services/academic-year-calendar.service';
import {AcademicYearCalendar} from '../models/academic-year-calendar';
import {Semester} from '../models/semester';

export type catalogLayout = 'class_master' | 'class_students' | string;

class ExpandedCell {
  rowIndex: number;
  colIndex: number;
  identifier: CellIdentifier;
  data: any;

  constructor(obj?) {
    this.rowIndex = obj?.rowIndex;
    this.colIndex = obj?.colIndex;
    this.identifier = obj?.identifier;
    this.data = obj?.data;
  }
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input() data: any[];
  @Input() tableLayout: 'class_master' | 'class_students' | 'student_catalog' | 'students_situation_ors' | string;

  @Output() addGradeToStudent: EventEmitter<any> = new EventEmitter<any>();
  @Output() addAbsenceToStudent: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteGrade: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteAbsence: EventEmitter<any> = new EventEmitter<any>();
  @Output() authorizeAbsence: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLinkClick: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('scrollContainer', {static: false}) scrollContainer: ElementRef;
  @ViewChild('tableHeader', {static: false}) tableHeader: ElementRef;
  @ViewChild('tableSubheader', {static: false}) tableSubheader: ElementRef;
  @ViewChild('expandedCellElem', {static: false}) expandedCellElem: ElementRef;

  internalData: any[];
  internalLayout: CatalogLayout;
  expandedCell: ExpandedCell = new ExpandedCell();
  academicCalendar: AcademicYearCalendar;
  expandableCells: boolean[][];
  editableCells: boolean[][];

  constructor(academicCalendarService: AcademicYearCalendarService) {
    academicCalendarService.getData(false).subscribe(response => {
      // TODO: Set academic year from request after demo.
      // this.academicCalendar = new AcademicYearCalendar(response);
    });

    this.academicCalendar = new AcademicYearCalendar({
      first_semester: new Semester({
        starts_at: '15-09-2019',
        ends_at: '18-02-2020'
      }),
      second_semester: new Semester({
        starts_at: '01-03-2019',
        ends_at: '15-08-2020'
      })
    });

    this.bringExpandedCellToScreen = this.bringExpandedCellToScreen.bind(this);
    this.stickTableHeadBelowPageHeader = this.stickTableHeadBelowPageHeader.bind(this);
  }

  ngAfterViewInit() {
    this.scrollContainer.nativeElement.addEventListener('scroll', this.bringExpandedCellToScreen);
    document.body.addEventListener('scroll', this.stickTableHeadBelowPageHeader);
  }

  private stickTableHeadBelowPageHeader() {
    const pageHeader = window.innerWidth > 1024
      ? document.getElementById('page-header')
      : document.getElementById('nav-bar');
    const table = this.scrollContainer.nativeElement;
    const tableHeader = this.tableHeader.nativeElement;
    const tableSubheader = this.tableSubheader.nativeElement;
    const pointToStickTo = pageHeader.getBoundingClientRect().top + pageHeader.getBoundingClientRect().height;

    if (table.getBoundingClientRect().top < pointToStickTo) {
      tableHeader.style.transform = `translateY(${pointToStickTo - table.getBoundingClientRect().top}px)`;
    } else {
      tableHeader.style.transform = 'none';
    }

    if (table.getBoundingClientRect().top < pointToStickTo) {
      tableSubheader.style.transform = `translateY(${pointToStickTo - table.getBoundingClientRect().top}px)`;
    } else {
      tableSubheader.style.transform = 'none';
    }
  }

  private bringExpandedCellToScreen() {
    if (this.expandedCellElem) {
      this.expandedCellElem.nativeElement.style.left = `${this.scrollContainer.nativeElement.scrollLeft}px`;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data?.currentValue) {
      this.internalData = this.formatTableData(changes.data.currentValue);
      this.refreshExpandedCellData();
    }

    if (changes.tableLayout) {
      this.internalLayout = this.getLayout(changes.tableLayout.currentValue);
    }

    if ((changes.tableLayout || changes.data) && (this.internalData && this.internalLayout)) {
      this.initialiseExpandableEditableCells(this.internalData, this.internalLayout);
    }
  }

  private getLayout(layout: catalogLayout): CatalogLayout {
    switch (layout) {
      case 'class_master':
        return classMastery;
      case 'class_students':
        return classPupils;
      case 'student_catalog':
        return studentCatalog;
      case 'student_own_situation':
        return studentOwnSituation;
      case 'students_situation_ors':
        return studentsSituationOrs;
      case 'students_situation_teacher_principal':
        return studentsSituationTeacherPrincipal;
      default:
        return ownClassSubject;
    }
  }

  private formatTableData(data: any[]): any[] {
    return data.map((studentRow) => {
      const newRow = cloneDeep(studentRow);
      this.formatGradesList(newRow);
      return newRow;
    });
  }

  // Modifies parameter
  private formatGradesList(tableRow): void {
    const gradesKeys = {
      sem1: {grades: 'grades_sem1', avg: 'avg_sem1'},
      sem2: {grades: 'grades_sem2', avg: 'avg_sem2'}
    };

    Object.keys(gradesKeys).forEach((semKey: string) => {
      const sem = gradesKeys[semKey];
      if (!tableRow[sem.grades]) {
        return;
      }
      tableRow[sem.grades] = {
        grades: tableRow[sem.grades].filter(grade => grade.grade_type === 'REGULAR'),
        thesis: tableRow[sem.grades].filter(grade => grade.grade_type === 'THESIS')[0],
        avg: tableRow[sem.avg]
      };
    });
  }

  private initialiseExpandableEditableCells(data: any[], layout: CatalogLayout): void {
    this.expandableCells = [];
    this.editableCells = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      this.expandableCells[i] = [];
      this.editableCells[i] = [];
      for (let j = 0; j < layout.dataRow.length; j++) {
        const layoutColumn = layout.dataRow[j];
        this.expandableCells[i][j] = null;
        this.editableCells[i][j] = null;
        if (layoutColumn.expandableDecider) {
          this.expandableCells[i][j] = layoutColumn.expandableDecider(this.academicCalendar, row);
        }
        if (layoutColumn.editableDecider) {
          this.editableCells[i][j] = layoutColumn.editableDecider(this.academicCalendar, row);
        }
      }
    }
  }

  expandCell(rowIndex, colIndex): void {
    const identifier = this.internalLayout.dataRow[colIndex].identifier;
    const data = this.getDataForExpandedCell(identifier, this.internalData[rowIndex]);
    this.expandedCell = new ExpandedCell({rowIndex, colIndex, identifier, data});
    window.requestAnimationFrame(() => {
      this.bringExpandedCellToScreen();
    });
  }

  private refreshExpandedCellData(): void {
    const {identifier, rowIndex} = this.expandedCell;
    this.expandedCell.data = this.getDataForExpandedCell(identifier, this.internalData[rowIndex]);
    window.requestAnimationFrame(() => {
      this.bringExpandedCellToScreen();
    });
  }

  private getDataForExpandedCell(identifier: CellIdentifier, dataRow): any {
    switch (identifier) {
      case 'grades_sem_1': {
        return dataRow.grades_sem1;
      }
      case 'grades_sem_2': {
        return dataRow.grades_sem2;
      }
      case 'grade_annual': {
        return {
          avg_annual: dataRow.avg_annual,
          avg_after_2nd_examination: dataRow.avg_after_2nd_examination
        };
      }
      case 'abs_sem_1': {
        return dataRow.abs_sem1;
      }
      case 'abs_sem_2': {
        return dataRow.abs_sem2;
      }
      case 'abs_annual': {
        return {
          abs_count_annual: dataRow.abs_count_annual,
          founded_abs_cont_annual: dataRow.founded_abs_count_annual
        };
      }
    }
  }

  addGrade(grade: { selectedGrade: number, selectedDate: Date, id: number }, rowIndex: number, cellIdentifier: string): void {
    this.addGradeToStudent.emit({
      grade: grade,
      id: this.internalData[rowIndex].id,
      semester: cellIdentifier
    });
  }

  addAbsence(absence: { date: Date, isFounded: boolean }, rowIndex: number, cellIdentifier: string): void {
    this.addAbsenceToStudent.emit({
      absence: absence,
      id: this.internalData[rowIndex].id,
      semester: cellIdentifier
    });
  }

  closeExpand(): void {
    this.expandedCell = null;
  }

  ngOnDestroy(): void {
    this.scrollContainer.nativeElement.removeEventListener('scroll', this.bringExpandedCellToScreen);
    document.body.removeEventListener('scroll', this.stickTableHeadBelowPageHeader);
  }

}
