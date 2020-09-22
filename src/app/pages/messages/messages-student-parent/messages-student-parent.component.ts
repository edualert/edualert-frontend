import {AfterViewInit, Component, Injector, OnDestroy} from '@angular/core';
import {MessagesComponent, MessagesRequestParams} from '../messages.component';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {ReceivedMessage, SentMessage} from '../../../models/message';
import {NetworkingListResponse} from '../../../models/networking-list-response';


@Component({
  selector: 'app-messages-student-parent',
  templateUrl: './messages-student-parent.component.html',
  styleUrls: ['./messages-student-parent.component.scss', '../list-header-style.scss', '../list-general-styles.scss']
})
export class MessagesStudentParentComponent extends MessagesComponent implements AfterViewInit, OnDestroy {
  messages: ReceivedMessage[];

  constructor(injector: Injector, private http: HttpClient) {
    super(injector);

    this.scrollHandle = this.scrollHandle.bind(this);
    this.requestDataFunc = this.requestData;
    this.initialBodyHeight = document.body.getBoundingClientRect().height;

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.messages = [];
      this.requestedPageCount = 1;
      this.activeUrlParams = urlParams;
      this.requestData(urlParams);
    });
  }

  requestData(urlParams?: Params): void {
    this.requestInProgress = !this.keepOldList;
    this.initialRequestInProgress = true;
    const httpParams = new MessagesRequestParams({...urlParams, page_size: 10}).getHttpParams();
    const path = 'my-received-messages/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      if (response) {
        this.totalCount = response.count;
        response.results.map(result => this.messages.push(new ReceivedMessage(result)));
        this.elementCount = this.messages.length;
      }
      this.requestInProgress = false;
      this.initialRequestInProgress = false;
      this.keepOldList = false;
    });
  }

  ngAfterViewInit(): void {
    document.body.addEventListener('scroll', this.scrollHandle);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll',  this.scrollHandle);
  }

}
