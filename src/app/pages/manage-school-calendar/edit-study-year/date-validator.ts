export class DateValidator {

  static isValidFirstSemesterEnd(date: Date, firstSemesterEnd?: Date, secondSemesterStart?: Date): string | null {
    if (secondSemesterStart && date > secondSemesterStart) {
      return 'Data de sfârsit trebuie să fie înainte de cea de început a celui de al doilea semestru';
    }
    if (firstSemesterEnd && date < firstSemesterEnd) {
      return 'Data de început trebuie să fie după de cea de început a primului semestru';
    }
    return null;
  }

  static checkDateIsInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  static isDateUnique(currentStartDate: Date, currentEndDate: Date, object: {}[], index?: number): boolean {
    let error = true;
    for (const [i, schoolEvent] of object.entries()) {
      if (i === index) {
        continue;
      }
      if (schoolEvent['starts_at'] && (schoolEvent['ends_at'])) {
        const startDateToCompare = DateValidator.formatDateMMDDYYYY(schoolEvent['starts_at']);
        const endDateToCompare = DateValidator.formatDateMMDDYYYY(schoolEvent['ends_at']);
        if (currentEndDate.getTime() >= startDateToCompare.getTime() && currentStartDate.getTime() <= endDateToCompare.getTime()) {
          error = false;
        }
      }
    }

    return error;
  }

  static isDateAfter(date: Date, dateToCompare: Date): boolean {
    return date.getTime() > dateToCompare.getTime();
  }

  static formatDateMMDDYYYY(date: string) {
    const dateElem = date.split('-');
    return new Date(parseInt(dateElem[2], 10), (parseInt(dateElem[1], 10) - 1), parseInt(dateElem[0], 10));
  }

}
