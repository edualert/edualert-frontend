import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {OneTimeDataGetter} from './one-time-data-getter';
import {IdName} from '../models/id-name';

@Injectable({
  providedIn: 'root'
})
export class SchoolProfilesService extends OneTimeDataGetter {
  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath: string): Observable<IdName[]> {
    return super.getData(forceRequest, requestPath)
      .pipe(map((response: []) => (response).map(
        profile => new IdName(profile)
      )));
  }
}
