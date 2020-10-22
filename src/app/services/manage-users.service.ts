import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NetworkingListResponse} from '../models/networking-list-response';
import {Observable, BehaviorSubject} from 'rxjs';
import BaseRequestParameters from '../pages/list-page/base-request-parameters';


class RequestParams extends BaseRequestParameters {
  readonly search: string;
  readonly user_role: number;
  readonly is_active: boolean;
  readonly page_size: number;
  readonly page: number;

  constructor(newObj: { search?, user_role?, is_active?, page_size?, page? }) {
    super();
    this.search = newObj?.search;
    this.user_role = newObj?.user_role;
    this.is_active = newObj?.is_active;
    this.page_size = newObj?.page_size;
    this.page = newObj?.page;
  }
}


@Injectable()
export class ManageUsersService {
  private data: BehaviorSubject<{
    users: any[],
    totalCount: number,
  }> = new BehaviorSubject({ users: [], totalCount: 0 });
  private urlParams: any;
  private path: string = 'users/';

  constructor(private httpClient: HttpClient) {}

  setUrlParams(urlParams: any) {
    this.urlParams = urlParams;
  }

  refreshUsers() {
    const httpParams = new RequestParams({...this.urlParams, page_size: 10}).getHttpParams();

    return this.httpClient.get(this.path, {params: httpParams})
      .toPromise()
      .then(
        (response: NetworkingListResponse) => {
          const users = response.results;
          this.data.next({
            users,
            totalCount: response.count
          });

          return response;
        }
      );
  }

  requestUsers(afterDelete?: boolean) {
    let httpParams;
    if (afterDelete) {
      httpParams = new RequestParams({...this.urlParams}).getHttpParams();
    } else {
      httpParams = new RequestParams({...this.urlParams, page_size: 10}).getHttpParams();
    }

    return this.httpClient.get(this.path, {params: httpParams})
      .toPromise()
      .then(
      (response: NetworkingListResponse) => {
        this.data.next({
          users: this.data.value.users.concat(response.results),
          totalCount: response.count
        });

        return response;
      }
    );
  }

  getUsersObservable(): Observable<{
    users: any[],
    totalCount: number,
  }> {
    return this.data;
  }

}
