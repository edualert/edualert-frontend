import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {IdName} from '../models/id-name';
import {map} from 'rxjs/operators';
import {getCurrentAcademicYear} from '../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class AcademicProgramsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, class_grade?: string): Observable<IdName[]> {

    const currentAcademicYear = getCurrentAcademicYear();

    return super.getData(forceRequest, `years/${currentAcademicYear}/academic-programs/?class_grade=${class_grade}`).pipe(map((response) => (response.results).map(
      academic_profile => new IdName(academic_profile)
    )));
  }

}
