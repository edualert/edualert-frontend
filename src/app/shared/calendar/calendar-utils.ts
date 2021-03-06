import * as moment from 'moment';
import { DateValidator } from '../../pages/manage-school-calendar/edit-study-year/date-validator';

export const getMonthsInInterval = (startDate: moment.Moment, endDate: moment.Moment): string[] => {
  const startDateClone = startDate.clone().startOf('month');
  const result = [];

  if (endDate.isBefore(startDateClone)) {
    throw Error('End date must be greated than start date.');
  }

  while (startDateClone.isBefore(endDate)) {
    result.push(startDateClone.format('MMMM'));
    startDateClone.add(1, 'month');
  }

  return result;
};

export const getDatesInInterval = (startDate: moment.Moment, endDate: moment.Moment): string[] => {
  let startDateClone = startDate.clone();
  const result = [];

  if (endDate.isBefore(startDateClone)) {
    throw Error('End date must be greated than start date.');
  }
  while (startDateClone.isBefore(endDate)) {
    result.push(startDateClone.format('DD-MM-YYYY'));
    startDateClone = startDateClone.add(1, 'days');
  }

  return result;
};

export const getDatesInIntervalByMonths = (startDate: moment.Moment, endDate: moment.Moment): moment.Moment[][] => {
  let startDateClone = startDate.clone();
  const result = [];

  if (endDate.isBefore(startDateClone)) {
    throw Error('End date must be greated than start date.');
  }

  let lastDate;
  let i = 0;
  while (startDateClone.isBefore(endDate)) {
    result[i] = [];
    lastDate = startDateClone.clone();
    while (!lastDate.diff(startDateClone, 'months') && startDateClone.isBefore(endDate)) {
      result[i].push(startDateClone.clone());
      startDateClone = startDateClone.add(1, 'days');
    }
    i++;
  }

  return result;
};

export const getDatesInIntervalByWeekDays = (startDate: moment.Moment, endDate: moment.Moment, locale: string): moment.Moment[][] => {
  let startDateClone = startDate.clone();
  const result = [];

  if (endDate.isBefore(startDateClone)) {
    throw Error('End date must be greater than start date.');
  }

  const range = getDatesInInterval(startDateClone, endDate);
  let dayIndex = moment(range[0], 'DD-MM-YYYY').locale(locale).weekday();
  let i = 0;
  while (i < 7) {
    result[dayIndex] = [];
    while (startDateClone.isBefore(endDate)) {
      result[dayIndex].push(startDateClone.clone());
      startDateClone = startDateClone.add(7, 'days');
    }
    i++;
    dayIndex++;
    if (dayIndex >= 7) {
      dayIndex = 0;
    }
    startDateClone = moment(range[i], 'DD-MM-YYYY').locale(locale);
  }

  return result;
};

export const mapWeeksToMonths = (weekMapping: moment.Moment[][], months: string[], weekDaysStrings: string[]): { string?: { string: moment.Moment[] } } => {
  const result = {};
  const indices = {};
  weekDaysStrings.forEach((element) => indices[element] = 0);

  months.forEach(month => {
    result[month] = {};
    weekDaysStrings.forEach((weekDay, index) => {
      result[month][weekDay] = [];
      while (indices[weekDay] < weekMapping[index].length) {
        if (weekMapping[index][indices[weekDay]].format('MMMM') !== month) {
          break;
        }
        result[month][weekDay].push(weekMapping[index][indices[weekDay]].clone());
        indices[weekDay]++;
      }
    });
  });

  return result;
};

export const convertDateToString = function(date: Date): string {
  return date.getDate() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();
};

export const convertStringToDate = function(date: string): Date | string {
  if (date) {
    return moment(date, 'DD-MM-YYYY').toDate();
  }
  return '';
};

export const weekDays = (locale: string): string[] => [0, 1, 2, 3, 4, 5, 6].map(day => moment().locale(locale).weekday(day).format('dd'));

export const getStudyYearEndDate = function(firstSemesterDateString: Date): Date {
  const studyYearEndDate = new Date(firstSemesterDateString);
  studyYearEndDate.setFullYear(studyYearEndDate.getFullYear() + 1);
  studyYearEndDate.setDate(studyYearEndDate.getDate() - 1);
  return studyYearEndDate;
};

export const getMaxDateString = function(datesArray: string[]): string {
  let maxValue = 0;
  let maxDateString = '';
  datesArray.forEach(dateString => {
    const millisecondsOfDateToCompare = moment(dateString, 'DD-MM-YYYY').valueOf();
    if (millisecondsOfDateToCompare > maxValue) {
      maxValue = millisecondsOfDateToCompare;
      maxDateString = dateString;
    }
  });
  return maxDateString;
};
