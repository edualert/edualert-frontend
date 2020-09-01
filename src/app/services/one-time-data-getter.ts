import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Injector} from '@angular/core';
import {map} from 'rxjs/operators';

export class OneTimeDataGetter {
  private readonly httpClient: HttpClient;
  private data: BehaviorSubject<any> = new BehaviorSubject<any>(null); // BehaviourSubject because we sometimes need to get its latest value.
  private requested: boolean = false;

  constructor(injector: Injector) {
    this.httpClient = injector.get(HttpClient);
  }

  getData(forceRequest: boolean, requestPath?: string): Observable<any> {

    // If data hasn't been requested yet, request it from the server
    if (!this.requested || forceRequest) {
      return this.httpClient.get(requestPath)
        .pipe(
          // Set the internal state of the service, so we don't request again for this data.
          map((response: any) => {
            this.data.next(response);
            this.requested = true;
            return response;
          })
        );

    } else {
      return this.data;
    }
  }
}
