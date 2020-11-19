// TODO: Define classes and types

import {AcademicYearCalendar} from './academic-year-calendar';
import * as moment from 'moment';
import {Semester} from './semester';
import {unitOfTime} from 'moment';

export type CellIdentifier = 'name' | 'grades_sem_1' | 'grades_sem_2' | 'grade_annual' | 'abs_sem_1' | 'abs_sem_2' | 'abs_annual';
export type CellType =
  'name-cell'
  | 'subject-name-cell'
  | 'simple-number'
  | 'grades-list'
  | 'absences-list'
  | 'absences-count'
  | 'plain-text'
  | 'link-button'
  | 'labels'
  | 'annual-avg'
  | 'sem-avg';


export class CatalogLayout {
  readonly cellWidths: ('small' | 'regular' | 'big' | 'huge' | any)[];
  readonly headerRow: { label: string }[];
  readonly subheaderRow: { label: string }[];
  readonly dataRow: {
    type: CellType
    identifier: CellIdentifier;
    dataKey: string;
    pivotPoint: string | number;  // Point where the styles change (i.e. absence count per semester change at the count of 11, yearly count changes at 22)
    exceptionRuleKey: string | number;
    expandableDecider?: (academicCalendar: AcademicYearCalendar, rowData: any) => boolean
    editableDecider?: (academicCalendar: AcademicYearCalendar, rowData: any) => boolean
  }[];

  constructor(obj) {
    this.cellWidths = obj?.cellWidths;
    this.headerRow = obj?.headerRow;
    this.subheaderRow = obj?.subheaderRow;
    this.dataRow = obj?.dataRow;
    CatalogLayout.checkRowsLength(obj);
  }

  private static checkRowsLength(obj) {
    if (!obj) {
      return;
    }
    if (obj.headerRow.length && obj.headerRow.length > obj.cellWidths.length) {
      console.warn('WARNING: headerRow must be the same length or smaller as cellWidths');
    }
    if (obj.subheaderRow.length && obj.subheaderRow.length > obj.cellWidths.length) {
      console.warn('WARNING: subheaderRow must be the same length or smaller as cellWidths');
    }
    if (obj.dataRow.length && obj.dataRow.length > obj.cellWidths.length) {
      console.warn('WARNING: dataRow must be the same length or smaller as cellWidths');
    }
  }
}


export const ownClassSubject = new CatalogLayout({
  cellWidths: ['regular',
    [widthDecider, 'first_semester'],
    [widthDecider, 'second_semester'],
    'small',
    [widthDecider, 'first_semester'],
    [widthDecider, 'second_semester'],
    'small',
    'small'],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii'},
    {label: ''},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
    {label: ''},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Anuală'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Total'},
    {label: ''},
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {
      type: 'grades-list', identifier: 'grades_sem_1', dataKey: 'grades_sem1', pivotPoint: 4,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(yearStructure.first_semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData.grades_sem1.grades.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.first_semester)
    },
    {
      type: 'grades-list', identifier: 'grades_sem_2', dataKey: 'grades_sem2', pivotPoint: 4,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData.grades_sem2.grades.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        return semesterIsNow(yearStructure.second_semester);
      }
    },
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 4},
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem1?.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.first_semester)

    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem2?.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.second_semester)
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22, exceptionRuleKey: 'third_of_hours_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        if (!rowData || !rowData.abs_count_annual) {
          return false;
        }

        return true;
      }
    },
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
  ]
});


export const classMastery = new CatalogLayout({   // DIRIGENTIE
  cellWidths: ['regular',
    'small',
    'small',
    'small',
    [widthDecider, 'first_semester'],
    [widthDecider, 'second_semester'],
    'small'],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii la Purtare'},
    {label: ''},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
    {label: ''},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Anuală'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Total'},
    {label: ''},
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 6,
      expandableDecider: (yearStructure: AcademicYearCalendar) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester)) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar) => semesterIsNow(yearStructure.first_semester)
    },
    {
      type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 6,
      expandableDecider: (yearStructure: AcademicYearCalendar) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester)) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar) => semesterIsNow(yearStructure.second_semester)
    },
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 6},
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem1?.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.first_semester)
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem2?.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.second_semester)
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22, exceptionRuleKey: 'third_of_hours_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        return !!rowData;
      }
    },
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
  ],
});

export const classPupils = new CatalogLayout({   // ELEVII CLASEI
  cellWidths: ['regular', 'small', 'small', 'small', 'small', 'small', 'small', 'regular'],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii Generale'},
    {label: ''},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
    {label: ''},
    {label: ''},
    {label: ''}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Anuală'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Total'},
    {label: ''},
    {label: ''}
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 4},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 4},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 4},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'abs_count_sem2', pivotPoint: 11},
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        return !!rowData;
      }
    },
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
    {type: 'link-button', identifier: 'student_all_subjects', path: 'student-catalog/', dataKey: 'student'}
  ]
});

export const studentCatalog = new CatalogLayout({
  cellWidths: ['regular',
    [widthDecider, 'first_semester'],
    [widthDecider, 'second_semester'],
    'small',
    [widthDecider, 'first_semester'],
    [widthDecider, 'second_semester'],
    'small'],
  headerRow: [
    {label: 'Materii'},
    {label: ''},
    {label: 'Medii'},
    {label: ''},
    {label: ''},
    {label: 'Absente'},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Anuală'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Total'},
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'grades-list', identifier: 'grades_sem_1', dataKey: 'grades_sem1', pivotPoint: 4,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(yearStructure.first_semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData.grades_sem1.grades.length) {
          return false;
        }
        return true;
      }
    },
    {
      type: 'grades-list', identifier: 'grades_sem_2', dataKey: 'grades_sem2', pivotPoint: 4,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData.grades_sem2.grades.length) {
          return false;
        }
        return true;
      }
    },
    {type: 'sem-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 4},
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem1?.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.first_semester)
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem2?.length) {
          return false;
        }
        return true;
      },
      editableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => semesterIsNow(yearStructure.second_semester)
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 11,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        if (!rowData || !rowData.abs_count_annual) {
          return false;
        }

        return true;
      }
    },
  ]
});
export const studentOwnSituation = new CatalogLayout({
  cellWidths: ['regular',
    [widthDecider, 'first_semester'],
    [widthDecider, 'first_semester'],
    'small',
    [widthDecider, 'first_semester'],
    [widthDecider, 'first_semester'],
    'small'],
  headerRow: [
    {label: 'Materii'},
    {label: ''},
    {label: 'Medii'},
    {label: ''},
    {label: ''},
    {label: 'Absente'},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Anuală'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Total'},
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'grades-list', identifier: 'grades_sem_1', dataKey: 'grades_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(yearStructure.first_semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData.grades_sem1.grades.length) {
          return false;
        }
        return true;
      }
    },
    {
      type: 'grades-list', identifier: 'grades_sem_2', dataKey: 'grades_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData.grades_sem2.grades.length) {
          return false;
        }
        return true;
      }
    },
    {type: 'simple-number', identifier: 'grade_annual', dataKey: 'avg_annual'},
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.first_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem1?.length) {
          return false;
        }
        return true;
      }
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        const semester = yearStructure.second_semester;
        if (semesterIsInFuture(semester)) {
          return false;
        }
        if (semesterIsInPast(semester) && !rowData?.abs_sem2?.length) {
          return false;
        }
        return true;
      }
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => {
        if (!rowData || !rowData.abs_count_annual) {
          return false;
        }

        return true;
      }
    },
  ]
});

export const studentsSituationOrs = new CatalogLayout({
  cellWidths: ['regular', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'regular', 'huge', 'small', 'huge'],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii generale'}, {label: ''}, {label: ''},
    {label: 'Corigențe'},
    {label: 'Absențe nemotivate'}, {label: ''}, {label: ''},
    {label: 'Note purtare'}, {label: ''}, {label: ''},
    {label: 'Etichete'},
    {label: 'Unitate de învățământ'},
    {label: 'Clasă'},
    {label: 'Profil'}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'}, {label: 'Sem II'}, {label: 'Anuală'}, {label: ''},
    {label: 'Sem. I'}, {label: 'Sem. II'}, {label: 'Total'},
    {label: 'Sem. I'}, {label: 'Sem. II'}, {label: 'Anuală'}, {label: ''}, {label: ''}, {label: ''}, {label: ''},
  ],
  dataRow: [
    {type: 'plain-text', identifier: 'name', dataKey: 'student_name'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 4},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 4},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_final', pivotPoint: 5},
    {type: 'plain-text', identifier: 'second_examinations_count', dataKey: 'second_examinations_count', pivotPoint: 5},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'unfounded_abs_count_sem1', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'unfounded_abs_count_sem2', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_annual', dataKey: 'unfounded_abs_count_annual', pivotPoint: 22},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'behavior_grade_sem1', pivotPoint: 6},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'behavior_grade_sem2', pivotPoint: 6},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'behavior_grade_annual', pivotPoint: 6},
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
    {type: 'plain-text', identifier: 'school_unit', dataKey: 'school'},
    {type: 'plain-text', identifier: 'class_name', dataKey: 'class'},
    {type: 'plain-text', identifier: 'academic_program', dataKey: 'academic_program_name'},
  ]
});

export const studentsSituationTeacherPrincipal = new CatalogLayout({
  cellWidths: ['regular', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small', 'regular', 'small', 'huge',
    // 'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii generale'}, {label: ''}, {label: ''},
    {label: 'Corigențe'},
    {label: 'Absențe nemotivate'}, {label: ''}, {label: ''},
    {label: 'Note purtare'}, {label: ''}, {label: ''},
    {label: ''},
    {label: 'Clasă'},
    {label: 'Profil'}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'}, {label: 'Sem II'}, {label: 'Anuală'}, {label: ''},
    {label: 'Sem. I'}, {label: 'Sem. II'}, {label: 'Total'},
    {label: 'Sem. I'}, {label: 'Sem. II'}, {label: 'Anuală'}, {label: ''}, {label: ''}, {label: ''},
    // {label: ''},
  ],
  dataRow: [
    {type: 'plain-text', identifier: 'name', dataKey: 'student_name'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1'},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2'},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_final'},
    {type: 'plain-text', identifier: 'second_examinations_count', dataKey: 'second_examinations_count'},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'unfounded_abs_count_sem1'},
    {type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'unfounded_abs_count_sem2'},
    {type: 'absences-count', identifier: 'abs_sem_annual', dataKey: 'unfounded_abs_count_annual'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'behavior_grade_sem1'},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'behavior_grade_sem2'},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'behavior_grade_annual'},
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
    {type: 'plain-text', identifier: 'class_name', dataKey: 'class'},
    {type: 'plain-text', identifier: 'academic_program', dataKey: 'academic_program_name'},
    // TODO: Uncomment once backend is ready for this request
    // {type: 'link-button', identifier: 'student_all_subjects', path: 'student-catalog/', dataKey: 'student'}
  ]
});


function semesterIsInFuture(semester: Semester) {
  const now = moment().valueOf();
  const semesterStart = moment(semester.starts_at, 'DD-MM-YYYY').valueOf();
  return now < semesterStart;
}

function semesterIsNow(semester: Semester) {
  const now = moment().valueOf();
  const semesterStart = moment(semester.starts_at, 'DD-MM-YYYY').valueOf();
  const semesterEnd = moment(semester.ends_at, 'DD-MM-YYYY').valueOf();
  return now >= semesterStart && now <= semesterEnd;
}

function semesterIsInPast(semester: Semester) {
  const now = moment().valueOf();
  const semesterEnd = moment(semester.ends_at, 'DD-MM-YYYY').valueOf();
  return now > semesterEnd;
}

function widthDecider(semester: Semester) {
  return semesterIsNow(semester) ? 'big' : 'small';
}
