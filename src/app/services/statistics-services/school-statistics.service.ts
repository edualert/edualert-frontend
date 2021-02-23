import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {map} from 'rxjs/operators';
import {StudyClassAtRisk} from '../../models/study-class-name';
import {Absences, Averages} from '../../models/institution-statistics';

@Injectable({
  providedIn: 'root'
})
export class StudyClassesAtRiskService extends OneTimeDataGetter {

  private totalCount: number;

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number, page?: number): Observable<StudyClassAtRisk[]> {
    let path: string;
    if (page_size && page) {
      path = `study-classes-at-risk/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `study-classes-at-risk/?page_size=${page_size}`;
    } else {
      path = `study-classes-at-risk/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map((response: NetworkingListResponse) => {
        const studyClassesAtRisk = [];
        this.totalCount = response.count;
        if (response.count > 0) {
          response.results.forEach(studyClass => {
            studyClassesAtRisk.push(new StudyClassAtRisk(studyClass));
          });
        }
        return studyClassesAtRisk;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
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
            studyClass.name = `Clasa ${studyClass.class_grade} ${studyClass.class_letter}`;
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
            studyClass.name = `Clasa ${studyClass.class_grade} ${studyClass.class_letter}`;
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
