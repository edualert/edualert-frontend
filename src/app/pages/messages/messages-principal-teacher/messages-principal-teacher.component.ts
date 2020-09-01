import {Component, Injector} from '@angular/core';
import {MessagesComponent, MessagesRequestParams} from '../messages.component';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {SentMessage} from '../../../models/message';
import {NetworkingListResponse} from '../../../models/networking-list-response';


@Component({
  selector: 'app-messages-principal-teacher',
  templateUrl: './messages-principal-teacher.component.html',
  styleUrls: ['./messages-principal-teacher.component.scss', '../list-header-style.scss', '../list-general-styles.scss']
})
export class MessagesPrincipalTeacherComponent extends MessagesComponent {
  messages: SentMessage[];

  constructor(injector: Injector, private http: HttpClient) {
    super(injector);
    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams);
    });
  }

  requestData(urlParams?: Params): void {
    this.requestInProgress = true;
    const httpParams = new MessagesRequestParams(urlParams).getHttpParams();
    const path = 'my-sent-messages/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      if (response) {
        this.totalCount = response.count;
        this.messages = response.results.map(result => new SentMessage(result));
      }
      this.requestInProgress = false;
    });
  }
}
