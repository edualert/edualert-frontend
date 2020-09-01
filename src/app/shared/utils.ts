import * as moment from 'moment';
import {LocalStorageService} from '../services/local-storage.service';
import {monthDatesAndNames, weekdays} from './constants';
import {findIndex} from 'lodash';

export const academicYearStart = moment(`15.09.${moment().year()}`, 'DD.MM.YYYY');
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
  return phoneNumber.slice(0, 4) + ' ' + phoneNumber.slice(4, 7) + ' ' + phoneNumber.slice(7, 10);
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
  result.push(currentAcademicYear.year() + 1);

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

export function isTodayVacation(): boolean {
  const today = new Date();
  const vacationStart = new Date(today.getFullYear(), 5, 15);
  const vacationEnd = new Date(today.getFullYear(), 8, 15);
  if (today < vacationStart || today > vacationEnd) {
    return false;
  } else {
    return true;
  }
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

export function formatChartData(dataArray: any[], tooltipTitle: string, monthOfTheYear: number, countKey?: string): any {
  const chartFormattedData = [{
    'name': tooltipTitle,
    'series': []
  }];
  const xAxisTicks = [];

  const date = moment(`${moment().year()}-${monthOfTheYear + 1}`).toDate();

  const daysInMonth = moment(`${moment().year()}-${monthOfTheYear + 1}`).daysInMonth();
  for (let i = 1; i <= daysInMonth; i++) {
    xAxisTicks.push(i);
  }

  chartFormattedData[0]['series'] = dataArray.map(day => {
    return {
      'name': day['day'],
      'value': countKey && day[countKey] ? day[countKey] : day['count']
    };
  });

  return {
    chartData: chartFormattedData,
    xAxisTicks: xAxisTicks
  };
}

export function getDayOfTheWeek(day: number): string {
  const weekday = moment(`${moment().year()}-${moment().month()}-${day}`).day();
  return weekdays[findIndex(weekdays, {day: weekday})].name.substring(0, 2);
}

export function shouldDisplayChart(data: any[]): boolean {
  const key = data[0] && (data[0]['count'] !== null && data[0]['count'] !== undefined) ? 'count' : (data[0] && (data[0]['value'] !== null && data[0]['value'] !== undefined) ? 'value' : null);
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
    const headerSizeDelta = headerHeight >= 195 ? 173 : 203;
    chartHeight = currentScreenHeight - headerHeight - headerSizeDelta;
  }

  chartWH = window.innerWidth < 768 ? [800, chartHeight] : [1400, chartHeight];
  return chartWH;
}
