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
  totalCount: number;

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number, page?: number): Observable<InstitutionAtRisk[]> {
    let path: string;
    if (page_size && page) {
      path = `institutions-at-risk/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `institutions-at-risk/?page_size=${page_size}`;
    } else {
      path = `institutions-at-risk/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map((response: NetworkingListResponse) => {
        const institutionsAtRiskList: InstitutionAtRisk[] = [];
        if (response.count !== 0) {
          response.results.forEach(institution => {
            institutionsAtRiskList.push(new InstitutionAtRisk(institution));
          });
        }
        this.totalCount = response.count;
        return institutionsAtRiskList;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InactiveInstitutionsService extends OneTimeDataGetter {
  totalCount: number;

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number, page?: number): Observable<InactiveInstitution[]> {
    let path: string;
    if (page_size && page) {
      path = `inactive-institutions/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `inactive-institutions/?page_size=${page_size}`;
    } else {
      path = `inactive-institutions/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map((response: NetworkingListResponse) => {
        const inactiveInstitutionsList: InactiveInstitution[] = [];
        if (response.count !== 0) {
          response.results.forEach(institution => {
            inactiveInstitutionsList.push(new InactiveInstitution(institution));
          });
        }
        this.totalCount = response.count;
        return inactiveInstitutionsList;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
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
  totalCount: number = null;

  constructor(injector: Injector) {
    super(injector);
    this.getTotalCount = this.getTotalCount.bind(this);
  }

  getData(forceRequest: boolean, classId?: string, page_size?: number, page?: number): Observable<Averages[]> {
    let path: string;
    if (page_size && page) {
      path = `institutions-averages/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `institutions-averages/?page_size=${page_size}`;
    } else {
      path = `institutions-averages/`;
    }

    return super.getData(forceRequest, path)
      .pipe(map( (response: NetworkingListResponse) => {
        const listOfInstitutionsAverages: Averages[] = [];
        if (response.count > 0) {
          response.results.forEach( el => {
            listOfInstitutionsAverages.push(new Averages(el));
          });
        }
        this.totalCount = response.count;
        return listOfInstitutionsAverages;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionsAbsencesService extends OneTimeDataGetter {
  totalCount: number;

  constructor(injector: Injector) {
    super(injector);
    this.getTotalCount = this.getTotalCount.bind(this);
  }

  getData(forceRequest: boolean, classId?: string, page_size?: number, page?: number): Observable<Absences[]> {
    let path: string;
    if (page_size && page) {
      path = `institutions-absences/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `institutions-absences/?page_size=${page_size}`;
    } else {
      path = `institutions-absences/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map( (response: NetworkingListResponse) => {
        const listOfInstitutionsAbsences: Absences[] = [];
        if ( response.count > 0 ) {
          response.results.forEach( el => {
            listOfInstitutionsAbsences.push(new Absences(el));
          });
        }
        this.totalCount = response.count;
        return listOfInstitutionsAbsences;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
  }
}
