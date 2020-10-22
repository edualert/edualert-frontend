import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {AcademicProfileAtRisk} from '../../models/academic-program-details';
import {map} from 'rxjs/operators';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {Absences, Averages} from "../../models/institution-statistics";

@Injectable({
  providedIn: 'root'
})
export class AcademicProgramsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<AcademicProfileAtRisk[]> {
    return super.getData(forceRequest, 'programs-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const academicProgramsAtRiskList = [];
        if (response.count > 0) {
          response.results.forEach(academicProgram => {
            academicProgramsAtRiskList.push(new AcademicProfileAtRisk(academicProgram));
          });
        }
        return academicProgramsAtRiskList;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class AcademicProgramsAverageService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<Averages[]> {
    return super.getData(forceRequest, 'programs-averages/')
      .pipe(map((response: NetworkingListResponse) => {
        const academicProgramsAverageList = [];
        if (response.count > 0) {
          response.results.forEach(academicProgram => {
            academicProgramsAverageList.push(new Averages(academicProgram));
          });
        }
        return academicProgramsAverageList;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class AcademicProgramsAbsencesService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<Absences[]> {
    return super.getData(forceRequest, 'programs-absences/')
      .pipe(map((response: NetworkingListResponse) => {
        const academicProgramsAbsencesList = [];
        if (response.count > 0) {
          response.results.forEach(academicProgram => {
            academicProgramsAbsencesList.push(new Absences(academicProgram));
          });
        }
        return academicProgramsAbsencesList;
      }));
  }

}
