import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {InactiveTeacher} from '../../models/teacher';
import {map} from 'rxjs/operators';
import {NetworkingListResponse} from '../../models/networking-list-response';

@Injectable({
  providedIn: 'root'
})
export class InactiveTeachersService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<InactiveTeacher[]> {
    return super.getData(forceRequest, 'inactive-teachers')
      .pipe(map((response: NetworkingListResponse) => {
        const inactiveTeachersList = [];
        if (response.count > 0) {
          response.results.forEach(teacher => {
            inactiveTeachersList.push(new InactiveTeacher(teacher));
          });
        }
        return inactiveTeachersList;
      }));
  }

}
