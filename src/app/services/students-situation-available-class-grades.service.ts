import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from './one-time-data-getter';
import {AccountService} from './account.service';
import {Observable} from 'rxjs';
import {StudyClassGrade} from '../models/study-class';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentsSituationAvailableClassGradesService extends OneTimeDataGetter {

  constructor(injector: Injector, private accountService: AccountService) {
    super(injector);
  }

  getData(forceRequest: boolean, academicYear?: string): Observable<string[]> {
    const account = this.accountService.account.getValue();
    if (account.user_role === 'ADMINISTRATOR') {
      return new Observable((observer) => {
        observer.next(['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']);
        observer.complete();
      });
    } else {
      return super.getData(forceRequest, `years/${academicYear}/study-classes-names`)
        .pipe(map((grades: StudyClassGrade[]) => (grades).map(grade => grade.class_grade)));
    }
  }

}
