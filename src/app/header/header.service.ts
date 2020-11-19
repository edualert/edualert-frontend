import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private headerHeight: Subject<void> = new Subject();

  public refreshHeaderHeight() {
    this.headerHeight.next();
  }

  public getHeaderHeight(): Observable<void> {
    return this.headerHeight;
  }
}
