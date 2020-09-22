import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ChildSchoolActivity, ChildStatistics, SubjectForChild} from '../../models/child-statistics';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {AbsencesStatistics} from '../../models/graph-statistics';

@Injectable({
  providedIn: 'root'
})
export class ChildStatisticsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, childId?: string): Observable<ChildStatistics> {
    return super.getData(forceRequest, `own-child-statistics/${childId}/`)
      .pipe(map(response => new ChildStatistics(response)));
  }

}

@Injectable({
  providedIn: 'root'
})
export class ChildSchoolActivityService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, childId?: string): Observable<ChildSchoolActivity[]> {
    return super.getData(forceRequest, `own-child-activity-history/${childId}/`)
      .pipe(map((response: ChildSchoolActivityService[]) => response.map(child => new ChildSchoolActivity(child))
      ));
  }

}

@Injectable({
  providedIn: 'root'
})
export class ChildSubjectsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, childId?: string): Observable<SubjectForChild[]> {
    return super.getData(forceRequest, `own-child-subjects-at-risk/${childId}/`)
      .pipe(map((response: NetworkingListResponse) => {
          const listOfSubjects = [];
          if (response.count > 0) {
            response.results.forEach(subject => {
              listOfSubjects.push(new SubjectForChild(subject));
            });
          }
          return listOfSubjects;
        })
      );
  }

}

@Injectable({
  providedIn: 'root'
})
export class ChildAbsencesEvolutionService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, childId?: string, month?: number, byCategory?: boolean): Observable<AbsencesStatistics[]> {
    const path = byCategory ? `own-absences-evolution/?month=${month}&by_category=${byCategory}` : `own-child-absences-evolution/${childId}/?month=${month}`;
    return super.getData(forceRequest, path)
      .pipe(map((response: AbsencesStatistics[]) => response.map(absence => new AbsencesStatistics(absence))));
  }

}
