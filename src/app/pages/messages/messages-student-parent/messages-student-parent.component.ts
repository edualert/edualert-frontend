import {Component, Injector} from '@angular/core';
import {MessagesComponent, MessagesRequestParams} from '../messages.component';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {ReceivedMessage} from '../../../models/message';
import {NetworkingListResponse} from '../../../models/networking-list-response';


@Component({
  selector: 'app-messages-student-parent',
  templateUrl: './messages-student-parent.component.html',
  styleUrls: ['./messages-student-parent.component.scss', '../list-header-style.scss', '../list-general-styles.scss']
})
export class MessagesStudentParentComponent extends MessagesComponent {
  messages: ReceivedMessage[];

  constructor(injector: Injector, private http: HttpClient) {
    super(injector);
    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.requestData(urlParams);
    });
  }

  requestData(urlParams?: Params): void {
    this.requestInProgress = true;
    const httpParams = new MessagesRequestParams(urlParams).getHttpParams();
    const path = 'my-received-messages/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      if (response) {
        this.totalCount = response.count;
        this.messages = response.results.map(result => new ReceivedMessage(result));
      }
      this.requestInProgress = false;
    });
  }
}
