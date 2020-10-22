import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {Observable} from 'rxjs';
import {StudyClass, StudyClassGrade} from '../models/study-class';
import {HttpClient} from '@angular/common/http';
import {getCurrentAcademicYear} from '../shared/utils';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudyClassService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest?: boolean, id?: string): Observable<StudyClass> {
    return super.getData(forceRequest, 'study-classes/' + id);
  }

}

@Injectable({
  providedIn: 'root'
})
export class StudyClassAvailableGradesList extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, academicYear?: string): Observable<StudyClassGrade[]> {
    return super.getData(forceRequest, `years/${academicYear}/study-classes-names/`)
      .pipe(map((grades: StudyClassGrade[]) => (grades).map(grade => new StudyClassGrade(grade))));
  }

}

@Injectable({
  providedIn: 'root'
})
export class IsTeacherClassMasterService {
  private ownClassId: number;

  constructor(private httpClient: HttpClient) {
  }

  verifyIfClassMaster(): Observable<boolean> {
    const currentAcademicYear = getCurrentAcademicYear();
    return this.httpClient.get(`years/${currentAcademicYear}/own-study-classes/`)
      .pipe(map((response: any) => {
        let isClassMaster = false;
        if (response.hasOwnProperty('class_master') && response['class_master'].length > 0) {
          this.ownClassId = response['class_master'][0].hasOwnProperty('id') ? response['class_master'][0].id : null;
          isClassMaster = true;
        }
        return isClassMaster;
      }));
  }

  getOwnClassId(): number {
    return this.ownClassId ? this.ownClassId : null;
  }

}
