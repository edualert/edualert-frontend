import {Inject, Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {IdFullname} from '../models/id-fullname';

@Injectable({
  providedIn: 'root'
})
export class StudentsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<IdFullname[]> {
    return super.getData(forceRequest, 'students/?has_class=false')
      .pipe(map((response) => (response).map(
        student => new IdFullname(student)
      )));
  }
}
