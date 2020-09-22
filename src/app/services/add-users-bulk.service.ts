import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddUsersBulkService {

  private uploadPath: string = 'import-users/';

  constructor(private httpClient: HttpClient) {
  }

  uploadFile(file: FormData): Observable<any> {
    return this.httpClient.post(this.uploadPath, file);
  }

}
