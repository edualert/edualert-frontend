
export class InputValidator {

  static validateEmail(value: string): string | null {
    let error: string = null;
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/.test(value) || value?.length > 150) {
      error = 'Format incorect. Scrieți maxim 150 caractere în formatul: numeutilizator@numedomeniu.extensiedomeniu';
    }
    return error;
  }

  static validatePhoneNumber(value: string): string | null {
    let error: string = null;
    value = value.toString();
    const phoneNumber = value?.includes('+') ? value.slice(1, value.length - 1) : value;
    if (!/\+?[0-9]+$/.test(phoneNumber) || !(phoneNumber?.length >= 10 && phoneNumber?.length <= 20)) {
      error = 'Format incorect. Scrieți minim 10, maxim 20 caractere: doar cifre și semnul \'+\' sunt acceptate, fără spații.\n';
    }
    return error;
  }

  static validatePersonalID(value: string): string | null {
    let error: string = null;
    if (!/^[1-9]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(0[1-9]|[1-4]\d|5[0-2]|99)(00[1-9]|0[1-9]\d|[1-9]\d\d)\d$/.test(value)) {
      error = 'Format incorect. Scrieți 13 caractere, fără spații.';
    }
    return error;
  }


  static isRequiredError(value: any): string | null {
    return value && (/\S/.test(value)) ? null : 'Acest câmp este obligatoriu.';
  }

  static listHasElements(list: any[]): string | null {
    return list && list.length > 0 ? null : 'Acest câmp este obligatoriu.';
  }

  static isDateBefore(date: Date, referenceDate?: Date): boolean {
    return date <= referenceDate;
  }

  static isDateAfter(date: Date, referenceDate: Date): boolean {
    return date >= referenceDate;
  }

  static isDateInRange(date: Date, startDate: Date, endDate: Date) {
    return date > startDate && date < endDate;
  }

}
