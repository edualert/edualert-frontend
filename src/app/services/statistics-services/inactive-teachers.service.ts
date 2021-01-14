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

  private totalCount: number;

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number, page?: number): Observable<InactiveTeacher[]> {
    let path: string;
    if (page_size && page) {
      path = `inactive-teachers/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `inactive-teachers/?page_size=${page_size}`;
    } else {
      path = `inactive-teachers/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map((response: NetworkingListResponse) => {
        const inactiveTeachersList = [];
        this.totalCount = response.count;
        if (response.count > 0) {
          response.results.forEach(teacher => {
            inactiveTeachersList.push(new InactiveTeacher(teacher));
          });
        }
        return inactiveTeachersList;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
  }


}
