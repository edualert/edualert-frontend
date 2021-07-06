import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {findIndex} from 'lodash';
import {ChildSchoolActivity} from '../../models/child-statistics';

const CUSTOM_TEXTS_COLOR_CODES = [
  {
    event: 'ABSENCE_AUTHORIZATION',
    color: 'blue-text'
  },
  {
    event: 'NEW_AUTHORIZED_ABSENCE',
    color: 'blue-text'
  },
  {
    event: 'NEW_UNAUTHORIZED_ABSENCE',
    color: 'red-text'
  },
  {
    event: 'NEW_GRADE',
    color: 'blue-text'
  },
  {
    event: 'SECOND_EXAMINATION_AVERAGE',
    color: 'blue-text'
  },
  {
    event: 'DIFFERENCE_AVERAGE',
    color: 'blue-text'
  }
];

export class Column {
  backgroundColor: string;
  name: string;
  dataKey: string;
  columnType: string;
  minWidth: string; // expressed in px
  width: number; // expressed in %, sum of all widths must be up to 100%
  displayFormatter: (...param) => string | number;
  link: (...params) => string;
  linkParams: {};
  pivotPoint: string | number;
  thirdOfHoursPivotPoint: string | number;

  constructor(object?: any) {
    this.backgroundColor = object?.backgroundColor;
    this.name = object?.name;
    this.dataKey = object?.dataKey;
    this.columnType = object?.columnType;
    this.minWidth = object?.minWidth;
    this.displayFormatter = object?.displayFormatter;
    this.link = object?.link;
    this.linkParams = object?.linkParams;
    this.pivotPoint = object?.pivotPoint;
    this.thirdOfHoursPivotPoint = object?.thirdOfHoursPivotPoint;
  }

  public static checkSumOfWidths(columns: Column[]): boolean {
    let sum = 0;
    columns.forEach( column => {
      sum = sum + column.width;
    });
    return sum === 100;
  }
}

@Component({
  selector: 'app-reports-table',
  templateUrl: './reports-table.component.html',
  styleUrls: ['./reports-table.component.scss']
})
export class ReportsTableComponent {

  @ViewChild('fixedColumnBody') fixedColumnBody: ElementRef<any>;
  @ViewChild('scrollableColumnsHeader') scrollableColumnsHeader: ElementRef<any>;
  @ViewChild('scrollableColumnsBody') scrollableColumnsBody: ElementRef<any>;

  @Input() tableColumns: Column[];
  @Input() tableData: any;
  @Output() userHasBeenSelected = new EventEmitter<any>();

  getColorByEventType(data: ChildSchoolActivity) {
    const index = findIndex(CUSTOM_TEXTS_COLOR_CODES, {event: data.event_type});

    if (['NEW_GRADE', 'SECOND_EXAMINATION_AVERAGE', 'DIFFERENCE_AVERAGE'].includes(data.event_type)) {
      return data.grade_value < data.grade_limit ? 'red-text' : 'blue-text';
    }

    return index >= 0 ? CUSTOM_TEXTS_COLOR_CODES[index].color : 'blue-text';
  }

  triggerUserModalEvent(id) {
    this.userHasBeenSelected.emit(id);
  }

}
