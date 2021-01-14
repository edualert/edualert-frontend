import { Injectable, Injector } from '@angular/core';
import { OneTimeDataGetter } from './one-time-data-getter';
import { AccountService } from './account.service';
import { Observable } from 'rxjs';
import { StudyClassGrade } from '../models/study-class';
import { map, mergeMap } from 'rxjs/operators';
import { CurrentAcademicYearService } from './current-academic-year.service';
import { AcademicYearCalendar } from '../models/academic-year-calendar';

@Injectable({
  providedIn: 'root'
})
export class AvailableClassNamesService extends OneTimeDataGetter {

  constructor(injector: Injector,
              private accountService: AccountService,
              private currentAcademicYearService: CurrentAcademicYearService) {
    super(injector);
  }


  getData(forceRequest?: boolean, reqAcademicYear?: string): Observable<string[]> {
    const account = this.accountService.account.getValue();
    if (account.user_role === 'ADMINISTRATOR') {
      return new Observable((observer) => {
        observer.next(['P', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']);
        observer.complete();
      });
    }

    if (reqAcademicYear) {
      return super.getData(forceRequest, `years/${reqAcademicYear}/study-classes-names/`)
        .pipe(map((grades: StudyClassGrade[]) => (grades).map(grade => grade.class_grade)));
    }

    // If an explicit academic year is not present, then we do the request for the current academic year.
    return this.currentAcademicYearService.getData(true).pipe(
      mergeMap((academicYear: AcademicYearCalendar) => {
        return super.getData(forceRequest, `years/${academicYear.academic_year}/study-classes-names/`)
          .pipe(map((grades: StudyClassGrade[]) => (grades).map(grade => grade.class_grade)));
      })
    );
  }

}
