import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {OneTimeDataGetter} from './one-time-data-getter';
import {SchoolPrincipal} from '../models/school-principal';
import {NetworkingListResponse} from '../models/networking-list-response';

@Injectable({
  providedIn: 'root'
})
export class SchoolPrincipalsService extends OneTimeDataGetter {
  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest?: boolean): Observable<SchoolPrincipal[]> {
    return super.getData(forceRequest, 'school-principals/?has_school=false')
      .pipe(map(response => (response).map(
        name => new SchoolPrincipal(name)
      )));
  }
}
