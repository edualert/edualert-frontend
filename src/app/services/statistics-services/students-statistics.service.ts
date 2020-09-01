import {Injectable, Injector} from '@angular/core';
import {OneTimeDataGetter} from '../one-time-data-getter';
import {Observable} from 'rxjs';
import {StudentAtRisk} from '../../models/student-data-list';
import {map} from 'rxjs/operators';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {GraphStatistics} from '../../models/graph-statistics';
import {InactiveParent} from '../../models/parent';

@Injectable({
  providedIn: 'root'
})
export class StudentsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudentAtRisk[]> {
    return super.getData(forceRequest, 'school-students-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const studentsAtRiskList = [];
        if (response.count > 0) {
          response.results.forEach(student => {
            studentsAtRiskList.push(new StudentAtRisk(student));
          });
        }
        return studentsAtRiskList;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class OwnStudentsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudentAtRisk[]> {
    return super.getData(forceRequest, 'own-students-at-risk/')
      .pipe(map((response: NetworkingListResponse) => {
        const studentsAtRiskList = [];
        if (response.count > 0) {
          response.results.forEach(student => {
            studentsAtRiskList.push(new StudentAtRisk(student));
          });
        }
        return studentsAtRiskList;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class OwnStudentsAverageService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudentAtRisk[]> {
    return super.getData(forceRequest, 'own-students-averages/')
      .pipe(map((response: NetworkingListResponse) => {
        const studentsAverage = [];
        if (response.count > 0) {
          response.results.forEach(student => {
            studentsAverage.push(new StudentAtRisk(student));
          });
        }
        return studentsAverage;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class OwnStudentsAbsencesService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudentAtRisk[]> {
    return super.getData(forceRequest, 'own-students-absences/')
      .pipe(map((response: NetworkingListResponse) => {
        const studentsAtRiskList = [];
        if (response.count > 0) {
          response.results.forEach(student => {
            studentsAtRiskList.push(new StudentAtRisk(student));
          });
        }
        return studentsAtRiskList;
      }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class OwnStudentsBehaviourGradesService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<StudentAtRisk[]> {
    return super.getData(forceRequest, 'own-students-behavior-grades/')
      .pipe(map((response: NetworkingListResponse) => {
        const studentsAtRiskList = [];
        if (response.count > 0) {
          response.results.forEach(student => {
            studentsAtRiskList.push(new StudentAtRisk(student));
          });
        }
        return studentsAtRiskList;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class InactiveParentsService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<InactiveParent[]> {
    return super.getData(forceRequest, 'inactive-parents/')
      .pipe(map((response: NetworkingListResponse) => {
        const parents = [];
        if (response.count > 0) {
          response.results.forEach(student => {
            parents.push(new InactiveParent(student));
          });
        }
        return parents;
      }));
  }

}

@Injectable({
  providedIn: 'root'
})
export class OwnStudentsRiskEvolutionService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?:string, classId?: string, monthId?: string): Observable<GraphStatistics[]> {
    let url: string;
    if (classId && monthId) {
      url = `students-risk-evolution/?school_unit=${classId}&month=${monthId}`;
    } else if (classId) {
      url = `students-risk-evolution/?school_unit=${classId}`;
    } else if (monthId) {
      url = `students-risk-evolution/?month=${monthId}`;
    } else {
      url = `students-risk-evolution/`
    }
    return super.getData(forceRequest, url)
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
export class StudentsRiskEvolutionService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string , classId?: string): Observable<GraphStatistics[]> {
    const path = classId ? `students-risk-evolution/?month=${classId}` : `students-risk-evolution/`;
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
