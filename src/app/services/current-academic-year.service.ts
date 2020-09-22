import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {OneTimeDataGetter} from './one-time-data-getter';
import {AcademicYearCalendar} from '../models/academic-year-calendar';

@Injectable({
  providedIn: 'root'
})
export class CurrentAcademicYearService extends OneTimeDataGetter {
  constructor(private injector: Injector) {
    super(injector);
  }


  public getData(forceRequest?: boolean): Observable<AcademicYearCalendar> {
    return super.getData(forceRequest, 'current-academic-year-calendar/');
  }
}
