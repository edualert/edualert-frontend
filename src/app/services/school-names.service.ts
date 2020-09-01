import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {OneTimeDataGetter} from './one-time-data-getter';
import {IdName} from '../models/id-name';

@Injectable({
  providedIn: 'root'
})
export class SchoolNamesService extends OneTimeDataGetter {
  constructor(injector: Injector) {
    super(injector);
  }

  getDataUregisteredSchools(forceRequest?: boolean, requestPath?: string): Observable<IdName[]> {
    return super.getData(forceRequest, 'unregistered-school-units/')
      .pipe(map((response: any[]) => (response).map(
        name => new IdName(name)
      )));
  }

  getData(forceRequest?: boolean, requestPath?: string): Observable<IdName[]> {
    return super.getData(forceRequest, 'unregistered-school-units/')
      .pipe(map((response: any[]) => (response).map(
        name => new IdName(name)
      )));
  }

  getCustomData(forceRequest?: boolean, includeCityInName?: boolean): Observable<IdName[]> {
    return super.getData(forceRequest, 'school-units-names/')
      .pipe(map((response: any[]) => (response).map(
        entry => {
          if (includeCityInName) {
            entry.name += ` ${entry.city}`;
          }
          return new IdName(entry);
        }
      )));
  }
}
