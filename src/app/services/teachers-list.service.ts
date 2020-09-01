import {Inject, Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {InactiveTeacher, Teacher} from '../models/teacher';
import {NetworkingListResponse} from '../models/networking-list-response';

@Injectable({providedIn: 'root'})
export class TeachersListService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest?: boolean, isClassMaster?: string): Observable<Teacher[]> {
    if (isClassMaster) {
      return super.getData(forceRequest, 'teachers/?is_class_master=' + isClassMaster)
        .pipe(map((response) => (response).map(
          school_details => new Teacher(school_details)
        )));
    }
    return super.getData(forceRequest, 'teachers/')
      .pipe(map((response) => (response).map(
        school_details => new Teacher(school_details)
      )));
  }

}
