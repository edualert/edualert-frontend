import {AfterViewInit, Component, Injector, OnDestroy} from '@angular/core';
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
export class MessagesPrincipalTeacherComponent extends MessagesComponent implements AfterViewInit, OnDestroy {
  messages: SentMessage[] = [];

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
    const path = 'my-sent-messages/';
    this.http.get(path, {params: httpParams}).subscribe((response: NetworkingListResponse) => {
      if (response) {
        this.totalCount = response.count;
        response.results.map(result => this.messages.push(new SentMessage(result)));
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
