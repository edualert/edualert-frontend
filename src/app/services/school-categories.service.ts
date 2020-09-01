import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {OneTimeDataGetter} from './one-time-data-getter';
import {IdName} from '../models/id-name';
import {SchoolCategory} from '../models/school-details';

@Injectable({
  providedIn: 'root'
})
export class SchoolCategoriesService extends OneTimeDataGetter {
  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest?: boolean): Observable<SchoolCategory[]> {
    return super.getData(forceRequest, 'school-units-categories/')
      .pipe(map((response) => (response).map(
        category => new IdName(category)
      )));
  }
}
