import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IdName} from '../models/id-name';

@Injectable({
  providedIn: 'root'
})
export class SchoolUnitsProfilesService extends OneTimeDataGetter {
  constructor(injector: Injector) {
    super(injector);
  }
  getData(forceRequest?: boolean): Observable<IdName[]> {
    return super.getData(forceRequest, 'school-units-profiles/')
    // Pipe the Observable, so we send back to the caller the right types of objects.
      .pipe(map((profiles: IdName[]) => (profiles).map(profile => new IdName(profile))));
  }
}
