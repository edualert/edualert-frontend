import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {InactiveParent} from '../../models/parent';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactiveParentsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<InactiveParent[]> {
    return super.getData(forceRequest, 'inactive-parents/')
      .pipe(map((response: NetworkingListResponse) => {
        const inactiveParentsList: InactiveParent[] = [];
        if (response.count > 0) {
          response.results.forEach(parent => {
            inactiveParentsList.push(new InactiveParent(parent));
          });
        }
        return inactiveParentsList;
      }));
  }

}
