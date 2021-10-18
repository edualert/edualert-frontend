// TODO: Define classes and types

import { AcademicYearCalendar } from './academic-year-calendar';

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
    isClassMasteryTable?: boolean;
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

export const ownClassSubjectFirstSemester = new CatalogLayout({ // TAUGHT SUBJECT
  cellWidths: [
    'regular',
    'big',
    'big',
    'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii'},
    {label: 'Absențe'},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'},
    {label: ''},
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {
      type: 'grades-list', identifier: 'grades_sem_1', dataKey: 'grades_sem1', pivotPoint: 'avg_limit',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
  ]
});

export const ownClassSubjectSecondSemester = new CatalogLayout({ // TAUGHT SUBJECT
  cellWidths: [
    'regular',
    'small',
    'big',
    'small',
    'big',
    'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii'},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
    {label: ''}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: ''}
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length,
    },
    {
      type: 'grades-list', identifier: 'grades_sem_2', dataKey: 'grades_sem2', pivotPoint: 'avg_limit',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length,
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
  ]
});

export const ownClassSubjectSecondSemesterEnded = new CatalogLayout({ // TAUGHT SUBJECT
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'regular'
  ],
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
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem2?.grades?.length
    },
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.avg_after_2nd_examination},
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length,
    },
    {
      type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'abs_count_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem2?.length,
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22, exceptionRuleKey: 'third_of_hours_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_count_annual
    },
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
  ]
});

export const classMasteryFirstSemester = new CatalogLayout({   // DIRIGENTIE
  cellWidths: [
    'regular',
    'small',
    'big',
    'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii la Purtare'},
    {label: 'Absențe'},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'},
    {label: ''},
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
  ],
});

export const classMasterySecondSemester = new CatalogLayout({   // DIRIGENTIE
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'big',
    'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii la Purtare'},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: ''},
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
    },
    {
      type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 'avg_limit',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length,
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: () => true,
      editableDecider: () => true
    },
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
  ],
});

export const classMasterySecondSemesterEnded = new CatalogLayout({   // DIRIGENTIE
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'regular'
  ],
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
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
    },
    {
      type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 'avg_limit',
    },
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.avg_after_2nd_examination},
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length,
    },
    {
      type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'abs_count_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem2?.length,
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22, exceptionRuleKey: 'third_of_hours_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_count_annual
    },
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
  ],
});

export const classPupilsFirstSemester = new CatalogLayout({   // ELEVII CLASEI
  cellWidths: [
    'regular',
    'small',
    'small',
    'regular',
    'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii Generale'},
    {label: 'Absențe'},
    {label: ''},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'},
    {label: ''},
    {label: ''}
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11},
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
    {type: 'link-button', identifier: 'student_all_subjects', path: 'student-catalog/', dataKey: 'student'}
  ]
});

export const classPupilsSecondSemester = new CatalogLayout({   // ELEVII CLASEI
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'regular',
    'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii Generale'},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
    {label: ''},
    {label: ''}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: ''},
    {label: ''}
  ],
  dataRow: [
    {type: 'name-cell', identifier: 'name', dataKey: 'student'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 5},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'abs_count_sem2', pivotPoint: 11},
    {type: 'labels', identifier: 'labels', dataKey: 'student'},
    {type: 'link-button', identifier: 'student_all_subjects', path: 'student-catalog/', dataKey: 'student'}
  ]
});

export const classPupilsSecondSemesterEnded = new CatalogLayout({   // ELEVII CLASEI
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'regular',
    'regular'
  ],
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
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 5},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 5,
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.avg_after_2nd_examination},
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

export const studentCatalogFirstSemester = new CatalogLayout({ // Toate materiile
  cellWidths: [
    'regular',
    'big',
    'big'
  ],
  headerRow: [
    {label: 'Materii'},
    {label: 'Medii'},
    {label: 'Absențe'}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'}
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'grades-list', identifier: 'grades_sem_1', dataKey: 'grades_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length,
      editableDecider: () => true
    }
  ]
});

export const studentCatalogSecondSemester = new CatalogLayout({ // Toate materiile
  cellWidths: [
    'regular',
    'small',
    'big',
    'small',
    'big'
  ],
  headerRow: [
    {label: 'Materii'},
    {label: 'Medii'},
    {label: ''},
    {label: 'Absențe'},
    {label: ''}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Sem. I'},
    {label: 'Sem. II'}
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'grades-list', identifier: 'grades_sem_2', dataKey: 'grades_sem2', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem2?.grades?.length
    },
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem2?.length,
      editableDecider: () => true
    }
  ]
});

export const studentCatalogSecondSemesterEnded = new CatalogLayout({ // Toate materiile
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small'
  ],
  headerRow: [
    {label: 'Materii'},
    {label: 'Medii'},
    {label: ''},
    {label: ''},
    {label: 'Absențe'},
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
    {label: 'Total'}
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem2?.grades?.length
    },
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.avg_after_2nd_examination},
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length
    },
    {
      type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'abs_count_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem2?.length
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22, exceptionRuleKey: 'third_of_hours_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_count_annual
    }
  ]
});

export const studentOwnSituationFirstSemester = new CatalogLayout({
  cellWidths: [
    'regular',
    'big',
    'big',
  ],
  headerRow: [
    {label: 'Materii'},
    {label: 'Medii'},
    {label: 'Absențe'},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'},
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'grades-list', identifier: 'grades_sem_1', dataKey: 'grades_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'absences-list', identifier: 'abs_sem_1', dataKey: 'abs_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length
    }
  ]
});

export const studentOwnSituationSecondSemester = new CatalogLayout({
  cellWidths: [
    'regular',
    'small',
    'big',
    'small',
    'big',
  ],
  headerRow: [
    {label: 'Materii'},
    {label: 'Medii'},
    {label: ''},
    {label: 'Absențe'},
    {label: ''},
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
    {label: 'Sem. I'},
    {label: 'Sem. II'},
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'grades-list', identifier: 'grades_sem_2', dataKey: 'grades_sem2', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem2?.grades?.length
    },
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length
    },
    {
      type: 'absences-list', identifier: 'abs_sem_2', dataKey: 'abs_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem2?.length
    }
  ]
});

export const studentOwnSituationSecondSemesterEnded = new CatalogLayout({
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small'
  ],
  headerRow: [
    {label: 'Materii'},
    {label: 'Medii'},
    {label: ''},
    {label: ''},
    {label: 'Absențe'},
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
    {label: 'Total'}
  ],
  dataRow: [
    {type: 'subject-name-cell', identifier: 'name', dataKey: 'subject'},
    {
      type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem1?.grades?.length
    },
    {
      type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 'avg_limit',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.grades_sem2?.grades?.length
    },
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_annual', pivotPoint: 'avg_limit'},
    {
      type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'abs_count_sem1', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem1',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem1?.length
    },
    {
      type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'abs_count_sem2', pivotPoint: 11, exceptionRuleKey: 'third_of_hours_count_sem2',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_sem2?.length
    },
    {
      type: 'absences-count', identifier: 'abs_annual', dataKey: 'abs_count_annual', pivotPoint: 22, exceptionRuleKey: 'third_of_hours_count_annual',
      expandableDecider: (yearStructure: AcademicYearCalendar, rowData: any) => rowData?.abs_count_annual
    }
  ]
});

export const studentsSituationOrsSecondSemester = new CatalogLayout({
  cellWidths: [
    'regular', // Nume
    'small', // Medii sem1
    'small', // Absențe sem1
    'small', // Nota purtare sem1
    'regular', // Etichete
    'huge', // Unitate de învățământ
    'small', // Clasa
    'huge' // Profil
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii'},
    {label: 'Absențe'},
    {label: 'Purtare'},
    {label: 'Etichete'},
    {label: 'Unitate de învățământ'},
    {label: 'Clasă'},
    {label: 'Profil'}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'},
    {label: 'Sem. I'}, {label: ''}, {label: ''}, {label: ''}, {label: ''},
  ],
  dataRow: [
    {type: 'plain-text', identifier: 'name', dataKey: 'student_name'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'unfounded_abs_count_sem1', pivotPoint: 11},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'behavior_grade_sem1', pivotPoint: 'behavior_grade_limit'},
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
    {type: 'plain-text', identifier: 'school_unit', dataKey: 'school'},
    {type: 'plain-text', identifier: 'class_name', dataKey: 'class'},
    {type: 'plain-text', identifier: 'academic_program', dataKey: 'academic_program_name'},
  ]
});

export const studentsSituationOrsSecondSemesterEnded = new CatalogLayout({
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'regular',
    'huge',
    'small',
    'huge'
  ],
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
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 5},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_final', pivotPoint: 5},
    {type: 'second-examinations-count', identifier: 'second_examinations_count', dataKey: 'second_examinations_count', pivotPoint: 5},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'unfounded_abs_count_sem1', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'unfounded_abs_count_sem2', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_annual', dataKey: 'unfounded_abs_count_annual', pivotPoint: 22},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'behavior_grade_sem1', pivotPoint: 'behavior_grade_limit'},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'behavior_grade_sem2', pivotPoint: 'behavior_grade_limit'},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'behavior_grade_annual', pivotPoint: 'behavior_grade_limit'},
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
    {type: 'plain-text', identifier: 'school_unit', dataKey: 'school'},
    {type: 'plain-text', identifier: 'class_name', dataKey: 'class'},
    {type: 'plain-text', identifier: 'academic_program', dataKey: 'academic_program_name'},
  ]
});

export const studentsSituationTeacherPrincipalSecondSemester = new CatalogLayout({
  cellWidths: [
    'regular', // Nume
    'small', // Medii sem1
    'small', // Absențe sem1
    'small', // Nota purtare sem1
    'regular', // Etichete
    'small', // Clasa
    'huge', // Profil
    // 'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii'},
    {label: 'Absențe n.'},
    {label: 'Purtare'},
    {label: 'Etichete'},
    {label: 'Clasă'},
    {label: 'Profil'}
  ],
  subheaderRow: [
    {label: ''},
    {label: 'Sem. I'},
    {label: 'Sem. I'},
    {label: 'Sem. I'}, {label: ''}, {label: ''}, {label: ''},
    // {label: ''},
  ],
  dataRow: [
    {type: 'plain-text', identifier: 'name', dataKey: 'student_name'},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'unfounded_abs_count_sem1', pivotPoint: 11},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'behavior_grade_sem1', pivotPoint: 'behavior_grade_limit'},
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
    {type: 'plain-text', identifier: 'class_name', dataKey: 'class'},
    {type: 'plain-text', identifier: 'academic_program', dataKey: 'academic_program_name'},
    // TODO: Uncomment once backend is ready for this request
    // {type: 'link-button', identifier: 'student_all_subjects', path: 'student-catalog/', dataKey: 'student'}
  ]
});

export const studentsSituationTeacherPrincipalSecondSemesterEnded = new CatalogLayout({
  cellWidths: [
    'regular',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'small',
    'regular',
    'small',
    'huge',
    // 'regular'
  ],
  headerRow: [
    {label: 'Nume'},
    {label: 'Medii generale'}, {label: ''}, {label: ''},
    {label: 'Corigențe'},
    {label: 'Absențe nemotivate'}, {label: ''}, {label: ''},
    {label: 'Note purtare'}, {label: ''}, {label: ''},
    {label: 'Etichete'},
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
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'avg_sem1', pivotPoint: 5},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'avg_sem2', pivotPoint: 5},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'avg_final', pivotPoint: 5},
    {type: 'second-examinations-count', identifier: 'second_examinations_count', dataKey: 'second_examinations_count', pivotPoint: 3},
    {type: 'absences-count', identifier: 'abs_sem_1', dataKey: 'unfounded_abs_count_sem1', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_2', dataKey: 'unfounded_abs_count_sem2', pivotPoint: 11},
    {type: 'absences-count', identifier: 'abs_sem_annual', dataKey: 'unfounded_abs_count_annual', pivotPoint: 22},
    {type: 'sem-avg', identifier: 'grades_sem_1', dataKey: 'behavior_grade_sem1', pivotPoint: 'behavior_grade_limit'},
    {type: 'sem-avg', identifier: 'grades_sem_2', dataKey: 'behavior_grade_sem2', pivotPoint: 'behavior_grade_limit'},
    {type: 'annual-avg', identifier: 'grade_annual', dataKey: 'behavior_grade_annual', pivotPoint: 'behavior_grade_limit'},
    {type: 'labels', identifier: 'labels', dataKey: 'labels'},
    {type: 'plain-text', identifier: 'class_name', dataKey: 'class'},
    {type: 'plain-text', identifier: 'academic_program', dataKey: 'academic_program_name'},
    // TODO: Uncomment once backend is ready for this request
    // {type: 'link-button', identifier: 'student_all_subjects', path: 'student-catalog/', dataKey: 'student'}
  ]
});
