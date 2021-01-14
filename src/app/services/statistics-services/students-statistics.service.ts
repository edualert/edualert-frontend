import { Injectable, Injector } from '@angular/core';
import { OneTimeDataGetter } from '../one-time-data-getter';
import { Observable } from 'rxjs';
import { StudentAtRisk } from '../../models/student-data-list';
import { map } from 'rxjs/operators';
import { NetworkingListResponse } from '../../models/networking-list-response';
import { GraphStatistics } from '../../models/graph-statistics';
import { InactiveParent } from '../../models/parent';
import { getFileFromBlobResponse } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class SchoolStudentsAtRiskService extends OneTimeDataGetter {

  private totalCount: number;

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number, page?: number): Observable<StudentAtRisk[]> {
    let path: string;
    if (page_size && page) {
      path = `school-students-at-risk/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `school-students-at-risk/?page_size=${page_size}`;
    } else {
      path = `school-students-at-risk/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map((response: NetworkingListResponse) => {
        const studentsAtRiskList = [];
        this.totalCount = response.count;
        if (response.count > 0) {
          response.results.forEach(student => {
            studentsAtRiskList.push(new StudentAtRisk(student));
          });
        }
        return studentsAtRiskList;
      }));
  }

  getTotalCount(): number {
    return this.totalCount;
  }

  downloadStudentsAtRiskCSVReport() {
    super.downloadXlsx('school-students-at-risk/export/').subscribe(
      blobResponse => {
        getFileFromBlobResponse(blobResponse, 'raport-top-elevi-cu-risc', '.xlsx');
      }
    );
  }

}

@Injectable({
  providedIn: 'root'
})
export class OwnStudentsAtRiskService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number): Observable<StudentAtRisk[]> {
    let path = `own-students-at-risk/`;
    if (page_size) {
      path = `own-students-at-risk/?page_size=${page_size}`;
    }

    return super.getData(forceRequest, path)
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

  totalCount: number;

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, page_size?: number, page?: number): Observable<InactiveParent[]> {
    let path: string;
    if (page_size && page) {
      path = `inactive-parents/?page_size=${page_size}&page=${page}`;
    } else if (page_size) {
      path = `inactive-parents/?page_size=${page_size}`;
    } else {
      path = `inactive-parents/`;
    }
    return super.getData(forceRequest, path)
      .pipe(map((response: NetworkingListResponse) => {
        const parents = [];
        this.totalCount = response.count;
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
export class StudentsRiskEvolutionService extends OneTimeDataGetter {

  constructor(injector: Injector) {
    super(injector);
  }

  getData(forceRequest: boolean, requestPath?: string, month?: string, schoolId?: string): Observable<GraphStatistics[]> {
    let url: string;
    if (month && schoolId) {
      url = `students-risk-evolution/?school_unit=${schoolId}&month=${month}`;
    } else if (schoolId) {
      url = `students-risk-evolution/?school_unit=${schoolId}`;
    } else if (month) {
      url = `students-risk-evolution/?month=${month}`;
    } else {
      url = `students-risk-evolution/`;
    }

    return super.getData(forceRequest, url)
      .pipe(map((response: GraphStatistics[]) => {
        const listOfStudentsEvolution = [];
        if (response.length > 0) {
          response.forEach(dayOfEvolution => {
            listOfStudentsEvolution.push(new GraphStatistics(dayOfEvolution));
          });
        }
        return listOfStudentsEvolution;
      }));
  }

}
