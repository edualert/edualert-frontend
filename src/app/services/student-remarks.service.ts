import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentRemarksService {

  constructor(private httpClient: HttpClient) {
  }

  updateRemarksPerSubject(studentId, body): Observable<any> {
    const path = `catalogs-per-subject/${studentId}/remarks/`;
    return this.httpClient.put(path, body);
  }

  updateRemarksPerYear(studentId, body): Observable<any> {
    const path = `catalogs-per-year/${studentId}/remarks/`;
    return this.httpClient.put(path, body);
  }

  getRemarksPerSubject(studentId): Observable<any> {
    const path = `catalogs-per-subject/${studentId}/remarks/`;
    return this.httpClient.get(path);
  }

  getRemarksPerYear(studentId): Observable<any> {
    const path = `catalogs-per-year/${studentId}/remarks/`;
    return this.httpClient.get(path);
  }

}
