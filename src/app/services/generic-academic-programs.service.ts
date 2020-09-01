import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {IdName} from '../models/id-name';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenericAcademicProgramsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean): Observable<IdName[]> {
    return super.getData(forceRequest, `generic-academic-programs/`)
      .pipe(map((response) => (response).map(academic_profile => new IdName(academic_profile)
    )));
  }

}
