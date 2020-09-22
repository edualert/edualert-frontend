export class ScrollableList {

  keepOldList;
  initialBodyHeight;
  elementCount;
  totalCount;
  initialRequestInProgress;
  requestedPageCount;
  requestDataFunc;
  activeUrlParams;
  isOnReportsPage: boolean = false;
  page_size: number;
  page: number = 1;
  listEnded: boolean = false;
  activeTab: string;
  scrollPositions;


  constructor() {
    this.keepOldList = this.hasOwnProperty('keepOldList') ? this['keepOldList'] : null;
    this.initialBodyHeight = this.hasOwnProperty('initialBodyHeight') ? this['initialBodyHeight'] : null;
    this.elementCount = this.hasOwnProperty('elementCount') ? this['elementCount'] : null;
    this.totalCount = this.hasOwnProperty('totalCount') ? this['totalCount'] : null;
    this.initialRequestInProgress = this.hasOwnProperty('initialRequestInProgress') ? this['initialRequestInProgress'] : null;
    this.requestedPageCount = this.hasOwnProperty('requestedPageCount') ? this['requestedPageCount'] : null;
    this.requestDataFunc = this.hasOwnProperty('requestDataFunc') ? this['requestDataFunc'] : null;
    this.activeUrlParams = this.hasOwnProperty('activeUrlParams') ? this['activeUrlParams'] : null;
    this.scrollPositions = this.hasOwnProperty('scrollPositions') ? this['scrollPositions'] : {};
  }

  protected scrollHandle() {
    const initialHeight = this.initialBodyHeight;
    let scrollTop;
    const scrollHeight = document.body.scrollHeight;
    this.keepOldList = true;

    if (this.isOnReportsPage) {
      this.scrollPositions[this.activeTab] = document.body.scrollTop;
      scrollTop = this.scrollPositions[this.activeTab];
    } else {
      scrollTop = document.body.scrollTop;
    }

    this.listEnded = this.totalCount === this.elementCount;

    if (scrollHeight - scrollTop < initialHeight + 100
      && this.elementCount < this.totalCount
      && !this.initialRequestInProgress) {
      if (this.isOnReportsPage) {
        this.page += 1;
        this.requestDataFunc(this.activeTab);
      } else {
        this.requestedPageCount += 1;
        this.requestDataFunc({...this.activeUrlParams, page: this.requestedPageCount});
      }
    }
  }
}
