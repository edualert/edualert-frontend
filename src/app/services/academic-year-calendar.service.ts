import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {IdName} from '../models/id-name';

@Injectable({
  providedIn: 'root'
})
export class AcademicYearCalendarService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean): Observable<any> {
    return super.getData(forceRequest, `current-academic-year-calendar/`);
  }

}
