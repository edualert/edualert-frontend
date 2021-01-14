import * as moment from 'moment';
import { LocalStorageService } from '../services/local-storage.service';
import { monthDatesAndNames } from './constants';
import { findIndex } from 'lodash';
import { saveAs } from 'file-saver';

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

export function handleChartWidthHeight(currentScreenHeight?: number): number[] {
  let chartWH;
  let chartHeight = 330;

  if (currentScreenHeight) {
    const headerHeight = document.getElementById('page-header').getBoundingClientRect().height;
    const headerSizeDelta = headerHeight >= 195 ? 93 : 103;
    chartHeight = currentScreenHeight - headerHeight - headerSizeDelta;
  }

  chartWH = window.innerWidth < 768 ? [800, chartHeight] : [1400, chartHeight];
  return chartWH;
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
