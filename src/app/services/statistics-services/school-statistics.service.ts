import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {map} from 'rxjs/operators';
import {StudyClassAtRisk} from '../../models/study-class-name';
import {Absences, Averages} from "../../models/institution-statistics";

@Injectable({
  providedIn: 'root'
})
export class StudyClassesAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudyClassAtRisk[]> {
    return super.getData(forceRequest, 'study-classes-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const studyClassesAtRisk = [];
        if (response.count > 0) {
          response.results.forEach(studyClass => {
            studyClassesAtRisk.push(new StudyClassAtRisk(studyClass));
          });
        }
        return studyClassesAtRisk;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class StudyClassesAverageService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<Averages[]> {
    return super.getData(forceRequest, 'study-classes-averages/')
      .pipe(map((response: NetworkingListResponse) => {
        const studyClassesAverage = [];
        if (response.count > 0) {
          response.results.forEach(studyClass => {
            studyClassesAverage.push(new Averages(studyClass));
          });
        }
        return studyClassesAverage;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class StudyClassesAbsencesService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<Absences[]> {
    return super.getData(forceRequest, 'study-classes-absences/')
      .pipe(map((response: NetworkingListResponse) => {
        const studyClassesAbsences = [];
        if (response.count > 0) {
          response.results.forEach(studyClass => {
            studyClassesAbsences.push(new Absences(studyClass));
          });
        }
        return studyClassesAbsences;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class OwnStudyClassesAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudyClassAtRisk[]> {
    return super.getData(forceRequest, 'own-study-classes-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const studyClassesAtRisk = [];
        if (response.count > 0) {
          response.results.forEach(studyClass => {
            studyClassesAtRisk.push(new StudyClassAtRisk(studyClass));
          });
        }
        return studyClassesAtRisk;
      }));
  }

}
