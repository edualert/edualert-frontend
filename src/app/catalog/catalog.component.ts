import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  CatalogLayout,
  CellIdentifier,
  classMasteryFirstSemester,
  classMasterySecondSemester,
  classMasterySecondSemesterEnded,
  classPupilsFirstSemester,
  classPupilsSecondSemester,
  classPupilsSecondSemesterEnded,
  ownClassSubjectFirstSemester,
  ownClassSubjectSecondSemester,
  ownClassSubjectSecondSemesterEnded,
  studentCatalogFirstSemester,
  studentCatalogSecondSemester,
  studentCatalogSecondSemesterEnded,
  studentOwnSituationFirstSemester,
  studentOwnSituationSecondSemester,
  studentOwnSituationSecondSemesterEnded,
  studentsSituationOrsSecondSemester,
  studentsSituationOrsSecondSemesterEnded,
  studentsSituationTeacherPrincipalSecondSemester,
  studentsSituationTeacherPrincipalSecondSemesterEnded,
} from '../models/catalog-layouts';
import { cloneDeep } from 'lodash';
import { AcademicYearCalendarService } from '../services/academic-year-calendar.service';
import { AcademicYearCalendar } from '../models/academic-year-calendar';
import { HeaderService } from '../header/header.service';
import * as moment from 'moment';

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
  @Input() tableLayout: 'class_master' | 'class_students' | 'student_catalog' | 'students_situation_ors' | 'students_situation_teacher_principal' | string;
  @Input() isClassMaster: boolean = false;
  @Input() activeTabId: any;

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

  currentSemester: number;

  constructor(academicCalendarService: AcademicYearCalendarService,
              private headerService: HeaderService) {
    academicCalendarService.getData(false).subscribe(response => {
      this.academicCalendar = new AcademicYearCalendar(response);

      const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();
      if (now <= moment(response.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.currentSemester = 1;
      } else if (now <= moment(response.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
        this.currentSemester = 2;
      }

      if (!this.internalLayout) {
        this.internalLayout = this.getLayout(this.tableLayout);
        if (this.internalData) {
          this.initialiseExpandableEditableCells(this.internalData, this.internalLayout);
        }
      }
    });

    this.bringExpandedCellToScreen = this.bringExpandedCellToScreen.bind(this);
  }

  ngAfterViewInit() {
    this.scrollContainer.nativeElement.addEventListener('scroll', this.bringExpandedCellToScreen);
  }

  private bringExpandedCellToScreen() {
    if (this.expandedCellElem) {
      this.expandedCellElem.nativeElement.style.left = `${this.scrollContainer.nativeElement.scrollLeft}px`;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data?.currentValue) {
      this.internalData = this.formatTableData(changes.data.currentValue);
      if (this.expandedCell) {
        this.refreshExpandedCellData();
      }
      this.headerService.refreshHeaderHeight();
    }

    if (changes.tableLayout && this.academicCalendar) {
      this.internalLayout = this.getLayout(changes.tableLayout.currentValue);
    }

    if ((changes.tableLayout || changes.data) && (this.internalData && this.internalLayout)) {
      this.initialiseExpandableEditableCells(this.internalData, this.internalLayout);
    }
  }

  private getLayout(layout: catalogLayout): CatalogLayout {
    switch (layout) {
      case 'class_master':
        switch (this.currentSemester) {
          case 1:
            return classMasteryFirstSemester;
          case 2:
            return classMasterySecondSemester;
          default:
            return classMasterySecondSemesterEnded;
        }
      case 'class_students':
        switch (this.currentSemester) {
          case 1:
            return classPupilsFirstSemester;
          case 2:
            return classPupilsSecondSemester;
          default:
            return classPupilsSecondSemesterEnded;
        }
      case 'student_catalog':
        switch (this.currentSemester) {
          case 1:
            return studentCatalogFirstSemester;
          case 2:
            return studentCatalogSecondSemester;
          default:
            return studentCatalogSecondSemesterEnded;
        }
      case 'student_own_situation':
        switch (this.currentSemester) {
          case 1:
            return studentOwnSituationFirstSemester;
          case 2:
            return studentOwnSituationSecondSemester;
          default:
            return studentOwnSituationSecondSemesterEnded;
        }
      case 'students_situation_ors':
        switch (this.currentSemester) {
          case 2:
            return studentsSituationOrsSecondSemester;
          default:
            return studentsSituationOrsSecondSemesterEnded;
        }
      case 'students_situation_teacher_principal':
        switch (this.currentSemester) {
          case 2:
            return studentsSituationTeacherPrincipalSecondSemester;
          default:
            return studentsSituationTeacherPrincipalSecondSemesterEnded;
        }
      default:
        switch (this.currentSemester) {
          case 1:
            return ownClassSubjectFirstSemester;
          case 2:
            return ownClassSubjectSecondSemester;
          default:
            return ownClassSubjectSecondSemesterEnded;
        }
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
      sem1: {grades: 'grades_sem1', avg: 'avg_sem1', avg_limit: 'avg_limit'},
      sem2: {grades: 'grades_sem2', avg: 'avg_sem2', avg_limit: 'avg_limit'}
    };

    Object.keys(gradesKeys).forEach((semKey: string) => {
      const sem = gradesKeys[semKey];
      if (!tableRow[sem.grades]) {
        return;
      }
      tableRow[sem.grades] = {
        grades: tableRow[sem.grades].filter(grade => grade.grade_type === 'REGULAR'),
        thesis: tableRow[sem.grades].filter(grade => grade.grade_type === 'THESIS')[0],
        avg: tableRow[sem.avg],
        avg_limit: tableRow[sem.avg_limit]
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
    data['wants_thesis'] = this.internalData[rowIndex]?.hasOwnProperty('wants_thesis') ? this.internalData[rowIndex].wants_thesis : null;
    data['is_exempted'] = this.internalData[rowIndex]?.hasOwnProperty('is_exempted') ? this.internalData[rowIndex].is_exempted : null;
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
        dataRow.grades_sem1.wants_thesis = dataRow.wants_thesis;
        dataRow.grades_sem2.is_exempted = dataRow.is_exempted;
        return dataRow.grades_sem1;
      }
      case 'grades_sem_2': {
        dataRow.grades_sem2.wants_thesis = dataRow.wants_thesis;
        dataRow.grades_sem2.is_exempted = dataRow.is_exempted;
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

  addGrade(grade: { selectedGrade: number, selectedDate: Date, id: number, isThesis?: boolean }, rowIndex: number, cellIdentifier: string): void {
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
  }

}
