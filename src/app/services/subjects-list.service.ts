import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IdName} from '../models/id-name';
import {ClassSubject} from '../models/study-class';

@Injectable({
  providedIn: 'root'
})
export class SubjectsListService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, academicProfile?: string, classGrade?: string): Observable<ClassSubject[]> {
    return super.getData(forceRequest, 'academic-programs/' + academicProfile + '/subjects/?grade=' + classGrade);
  }

}
