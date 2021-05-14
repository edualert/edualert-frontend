import * as moment from 'moment';
import { LocalStorageService } from '../services/local-storage.service';
import { monthDatesAndNames } from './constants';
import { findIndex } from 'lodash';
import { saveAs } from 'file-saver';
import { AcademicYearCalendar } from '../models/academic-year-calendar';

// TODO change this hardcoded date!
export const academicYearStart = moment(`07.09.${moment().year()}`, 'DD.MM.YYYY');
export const initialAcademicYear = 2019;

export const monthsRo = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

export function capitalizeString(str: string, separators: string[]): string {
  if (!str || typeof str !== 'string' || !separators || !separators.length) {
    return str;
  }
  let newStr = str;
  separators.forEach(function(separator) {
    newStr = newStr
      .split(separator)
      .map(word => word.charAt(0).toUpperCase() + word.substring(1))
      .join(separator);
  });
  return newStr;
}

export function formatPhoneNumber(phoneNumber: string): string {
  if (phoneNumber === null) {
    return '-';
  }
  return phoneNumber.slice(0, 4) + ' ' + phoneNumber.slice(4, 7) + ' ' + phoneNumber.slice(7, phoneNumber.length);
}

export const getCurrentAcademicYear = (): number => {
  const currentDate = moment();
  if (currentDate.isBefore(academicYearStart)) {
    return currentDate.subtract(1, 'years').year();
  }
  return currentDate.year();
};

// First year will be the future academic year
export const getAvailableAcademicYears = (): number[] => {
  const result = [];
  const currentAcademicYear = moment(getCurrentAcademicYear(), 'YYYY');

  while (currentAcademicYear.year() !== initialAcademicYear) {
    result.push(currentAcademicYear.year());
    currentAcademicYear.subtract(1, 'years');
  }
  result.push(initialAcademicYear);

  return result;
};

export function dateForInput(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();

  if (month.length < 2) {
    month = '0' + month;
  }

  if (day.length < 2) {
    day = '0' + day;
  }

  return [day, month, d.getFullYear()].join('.');
}

export function getLoginPageRoute(): string {
  if (!LocalStorageService.getIsFaculty()) {
    return '/login-admin';
  }
  return '/login-faculty';
}

export function getCurrentMonthAsString(): string {
  const currentDate = moment();
  return monthDatesAndNames[findIndex(monthDatesAndNames, {id: currentDate.month() + 1})].name;
}

export function getCurrentYear(): number {
  return moment().year();
}

export function formatChartData(dataArray: any[], tooltipTitle: string, countKey?: string): any {
  const chartFormattedData = [{
    'name': tooltipTitle,
    'series': []
  }];
  const xAxisTicks = [];

  chartFormattedData[0]['series'] = dataArray.map(day => {
    xAxisTicks.push(day['day']);
    return {
      'name': day['day'],
      'value': countKey && countKey in day ? day[countKey] : day['count'],
      'weekday': day['weekday'],
    };
  });

  return {
    chartData: chartFormattedData,
    xAxisTicks: xAxisTicks
  };
}

export function shouldDisplayChart(data: any[], countKey?: string): boolean {
  if (data.length === 0) {
    return false;
  }

  if (countKey === null || countKey === undefined) {
    countKey = 'count';
  }

  const key = data[0] && (data[0][countKey] !== null && data[0][countKey] !== undefined) ? countKey :
    (data[0] && (data[0]['value'] !== null && data[0]['value'] !== undefined) ? 'value' : null);
  const totalCount = data.reduce((acc, obj) => {
    return obj[key] ? acc + obj[key] : acc;
  }, 0);
  return totalCount > 0;
}

export function handleChartWidthHeight(currentScreenHeight?: number, hasMonthPicker?: boolean, hasTitle?: boolean): number[] {
  let chartWH;
  let chartHeight = 330;

  if (currentScreenHeight) {
    const headerHeight = document.getElementById('page-header').getBoundingClientRect().height;
    const headerSizeDelta = headerHeight >= 195 ? 93 : 103;
    const initialHeight = chartHeight;
    chartHeight = currentScreenHeight - headerHeight - headerSizeDelta;
    if (hasMonthPicker) {
      chartHeight = chartHeight - 15;
    }
    if (hasTitle) {
      chartHeight = chartHeight - 24;
    }
    document.documentElement.style.setProperty('--chartHeightAdjust', `${(chartHeight - initialHeight) / 2}px`);
  }

  chartWH = window.innerWidth < 768 ? [800, chartHeight] : [1400, chartHeight];
  return chartWH;
}

export function removeChartTooltip(): void {
  const chartTooltipElement = document.getElementsByClassName('type-tooltip')[0];
  if (chartTooltipElement) {
    chartTooltipElement.remove();
  }
}

export function compareSubjectsName(a, b) {
  return compare(a, b, 'subject_name');
}

//  General comparing function for objects by given field
export function compare(a, b, field) {
  //  Use toUpperCase() to ignore character casing
  const comparingItem = a.hasOwnProperty(field) ? a[field].toUpperCase() : null;
  const compareAgainst = b.hasOwnProperty(field) ? b[field].toUpperCase() : null;

  let comparison = 0;
  if (comparingItem && compareAgainst) {
    if (comparingItem > compareAgainst) {
      comparison = 1;
    } else if (comparingItem < compareAgainst) {
      comparison = -1;
    }
  }
  return comparison;
}

// fileExt should be accordingly to the response type
export function getFileFromBlobResponse(blobResponse: Blob, fileName: string, fileExt: string) {
  let responseType = '';
  switch (fileExt) {
    case '.xlsx':
      responseType = 'application/vnd.ms-excel';
  }
  const blob = new Blob([blobResponse], {type: responseType});
  const file = new File([blob], fileName + fileExt, {type: responseType});
  saveAs(file);
}

export function getCurrentSemesterStartDate(academicYearCalendar: AcademicYearCalendar): Date {
  const now = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').valueOf();
  if (now <= moment(academicYearCalendar.first_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
    return new Date(moment(academicYearCalendar.first_semester.starts_at, 'DD-MM-YYYY').valueOf());
  }
  if (now <= moment(academicYearCalendar.second_semester.ends_at, 'DD-MM-YYYY').valueOf()) {
    return new Date(moment(academicYearCalendar.second_semester.starts_at, 'DD-MM-YYYY').valueOf());
  }
}

/**
 * Sets the height of the scrollable container for both web and mobile screens
 *
 * After using it on a component, in ngOnDestroy please remove the style attribute
 * from document.body in order to remove the 'unset' value from overflow property
 */
export function setScrollableContainerHeight(): void {
  setTimeout(() => {
    const pageContent = document.getElementsByClassName('page-content')[0];
    const scrollableContainer = document.getElementsByClassName('scrollable-container')[0] as HTMLElement;
    const pageHeader = document.getElementById('page-header');
    const body = document.body;

    let navBar;
    let mobileFilterBox;
    let scrollableContainerComputedHeight;
    let toolbarHeight;
    let toolbarContainer;

    if (pageHeader.clientWidth < 1024) {
      navBar = document.getElementById('nav-bar');
      mobileFilterBox = document.getElementsByClassName('filter-label')[0];
      toolbarHeight = mobileFilterBox ? mobileFilterBox.clientHeight : 40;
    } else {
      toolbarContainer = document.getElementsByClassName('toolbar-container')[0];
      toolbarHeight = toolbarContainer ? toolbarContainer.getElementsByClassName('toolbar')[0].clientHeight : 46;
    }

    const diff = window.outerHeight - window.innerHeight;
    let browserInterfaceHeight = 0;

    if (diff) {
      browserInterfaceHeight = diff - 80; // iOS browser interface height
    } else {
      browserInterfaceHeight = 30; // android browser interface height
    }

    if (scrollableContainer.clientHeight > (body.clientHeight - pageHeader.clientHeight - toolbarHeight)) {
      if (pageHeader.clientWidth < 1024) {
        scrollableContainerComputedHeight = body.clientHeight - navBar.clientHeight - pageHeader.clientHeight - toolbarHeight - browserInterfaceHeight;
      } else {
        scrollableContainerComputedHeight = body.clientHeight - pageHeader.clientHeight - toolbarHeight - parseInt(window.getComputedStyle(pageContent).paddingTop, 10) - 5; // 5px empty space
      }
      scrollableContainer.style.height = scrollableContainerComputedHeight + 'px';
      body.style.overflow = 'unset';
    }
  }, 400);
}
