import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CatalogDataService {
  private subject = new Subject<any>();

  dataChanged(event) {
    this.subject.next(event);
  }

  getData() {
    return this.subject.asObservable();
  }
}
