import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {SchoolDetail} from '../models/school-details';

@Injectable({
  providedIn: 'root'
})
export class SchoolDetailsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest?: boolean): Observable<SchoolDetail> {
    return super.getData(forceRequest, 'my-school-unit/');
  }

}
