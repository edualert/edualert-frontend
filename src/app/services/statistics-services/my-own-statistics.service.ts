import {Inject, Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ChildSchoolActivity, ChildStatistics, SubjectForChild} from '../../models/child-statistics';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {AbsencesStatistics} from '../../models/graph-statistics';

@Injectable({
  providedIn: 'root'
})
export class MyOwnStatisticsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<ChildStatistics> {
    return super.getData(forceRequest, 'own-statistics/')
      .pipe(map(response => new ChildStatistics(response)));
  }

}

@Injectable({
  providedIn: 'root'
})
export class MyOwnSchoolActivityService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<ChildSchoolActivity[]> {
    return super.getData(forceRequest, 'own-activity-history/')
      .pipe(map((response: ChildSchoolActivity[]) => response.map(activity => new ChildSchoolActivity(activity))));
  }

}

@Injectable({
  providedIn: 'root'
})
export class MyOwnSubjectsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<SubjectForChild[]> {
    return super.getData(forceRequest, 'own-subjects-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const subjectsList = [];
        if (response.count > 0) {
          response.results.forEach(subject => {
            subjectsList.push(new SubjectForChild(subject));
          });
        }
        return subjectsList;
      }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class MyOwnAbsencesEvolutionService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, classId?:string, byCategory?: boolean): Observable<any> {
    return super.getData(forceRequest, `own-absences-evolution/?month=${classId}&by_category=${byCategory}`)
      .pipe(map((response: AbsencesStatistics[]) => response.map(absence => new AbsencesStatistics(absence))));
  }


}
