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

  handleScroll() {
    const tablesOnParentPage = document.getElementsByTagName('app-reports-table');
    for (let j = 0; j < tablesOnParentPage.length; j++) {
      const scrollcontainer = (tablesOnParentPage[j] as any).getElementsByClassName('scroll-container')[0];
      const table = (tablesOnParentPage[j] as any).getElementsByClassName('table')[0];
      const tablehead = (tablesOnParentPage[j] as any).getElementsByClassName('table-head')[0];
      const firstElementInTableHeader = tablehead.getElementsByClassName('head')[0];
      tablehead.style.transform = `translateY(${scrollcontainer.scrollTop}px)`;
      (tablehead as HTMLElement).style.position = 'relative';
      (tablehead as HTMLElement).style.zIndex = '4';
      (tablehead as HTMLElement).style.backgroundColor = this.tableColumns[0].backgroundColor;
      if (scrollcontainer.scrollLeft) {
        table.classList.add('extended-width');

        if (window.innerWidth > 768) {
          firstElementInTableHeader.style.transform = `translateX(${scrollcontainer.scrollLeft}px)`;
          firstElementInTableHeader.style.backgroundColor = this.tableColumns[0].backgroundColor;
          firstElementInTableHeader.style.boxShadow = `5px 0 5px -5px #D2DCE8`;

          for (let i = 0; i < table.getElementsByClassName('row').length; i++) {
            const div = table.getElementsByClassName('row')[i];
            (div.getElementsByClassName('row-data')[0] as HTMLElement).style.transform = `translateX(${scrollcontainer.scrollLeft}px)`;
            (div.getElementsByClassName('row-data')[0] as HTMLElement).style.backgroundColor = this.tableColumns[0].backgroundColor;
            (div.getElementsByClassName('row-data')[0] as HTMLElement).style.boxShadow = '5px 0 5px -5px #D2DCE8';
          }
        }
      } else {
        table.classList.remove('extended-width');
        firstElementInTableHeader.style.transform = `translateX(0px)`;
        firstElementInTableHeader.style.removeProperty('box-shadow');
        for (let i = 0; i < table.getElementsByClassName('row').length; i++) {
          const div = table.getElementsByClassName('row')[i];
          (div.getElementsByClassName('row-data')[0] as HTMLElement).style.transform = `translateX(0px)`;
          (div.getElementsByClassName('row-data')[0] as HTMLElement).style.removeProperty('box-shadow');
        }
      }
    }
  }

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
