import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {map} from 'rxjs/operators';
import {InactiveInstitution, InstitutionAtRisk} from '../../models/institution';
import {GraphStatistics} from '../../models/graph-statistics';
import {Absences, Averages} from "../../models/institution-statistics";
import {cleanSession} from 'selenium-webdriver/safari';

@Injectable({
  providedIn: 'root'
})
export class InstitutionsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<InstitutionAtRisk[]> {
    return super.getData(forceRequest, 'institutions-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const institutionsAtRiskList: InstitutionAtRisk[] = [];
        if (response.count !== 0) {
          response.results.forEach(institution => {
            institutionsAtRiskList.push(new InstitutionAtRisk(institution));
          });
        }
        return institutionsAtRiskList;
      }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class InactiveInstitutionsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<InactiveInstitution[]> {
    return super.getData(forceRequest, 'inactive-institutions/')
      .pipe(map((response: NetworkingListResponse) => {
        const inactiveInstitutionsList: InactiveInstitution[] = [];
        if (response.count !== 0) {
          response.results.forEach(institution => {
            inactiveInstitutionsList.push(new InactiveInstitution(institution));
          });
        }
        return inactiveInstitutionsList;
      }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionsEnrollmentStatisticsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, classId?: string): Observable<GraphStatistics[]> {
    const path = classId ? `institutions-enrollment-statistics/?month=${classId}` : `institutions-enrollment-statistics/`;
    return super.getData(forceRequest, path)
      .pipe(map( (response: GraphStatistics[]) => {
        const listOfStudentsEvolution = [];
        if ( response.length > 0 ) {
          response.forEach( dayOfEvolution => {
            listOfStudentsEvolution.push(new GraphStatistics(dayOfEvolution));
          });
        }
        return listOfStudentsEvolution;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class InstitutionsAverageService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, classId?: string): Observable<Averages[]> {
    return super.getData(forceRequest, `institutions-averages/`)
      .pipe(map( (response: NetworkingListResponse) => {
        const listOfInstitutionsAverages: Averages[] = [];
        if ( response.count > 0 ) {
          response.results.forEach( el => {
            listOfInstitutionsAverages.push(new Averages(el));
          });
        }
        return listOfInstitutionsAverages;
      }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionsAbsencesService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, classId?: string): Observable<Absences[]> {
    return super.getData(forceRequest, `institutions-absences/`)
      .pipe(map( (response: NetworkingListResponse) => {
        const listOfInstitutionsAbsences: Absences[] = [];
        if ( response.count > 0 ) {
          response.results.forEach( el => {
            listOfInstitutionsAbsences.push(new Absences(el));
          });
        }
        return listOfInstitutionsAbsences;
      }));
  }
}
