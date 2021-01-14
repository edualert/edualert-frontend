export class ScrollableList {

  keepOldList;
  initialBodyHeight;
  elementCount;
  totalCount;
  initialRequestInProgress;
  requestInProgress;
  requestedPageCount;
  requestDataFunc;
  activeUrlParams;
  isOnReportsPage: boolean = false;
  page_size: number;
  page: number = 1;
  listEnded: boolean = false;
  activeTab: string;
  scrollPositions;
  infiniteScrollTabIds: string[] = [];
  tabTopActive: string;

  constructor() {
    this.keepOldList = this.hasOwnProperty('keepOldList') ? this['keepOldList'] : null;
    this.initialBodyHeight = this.hasOwnProperty('initialBodyHeight') ? this['initialBodyHeight'] : null;
    this.elementCount = this.hasOwnProperty('elementCount') ? this['elementCount'] : null;
    this.totalCount = this.hasOwnProperty('totalCount') ? this['totalCount'] : null;
    this.initialRequestInProgress = this.hasOwnProperty('initialRequestInProgress') ? this['initialRequestInProgress'] : null;
    this.requestInProgress = this.hasOwnProperty('requestInProgress') ? this['requestInProgress'] : null;
    this.requestedPageCount = this.hasOwnProperty('requestedPageCount') ? this['requestedPageCount'] : null;
    this.requestDataFunc = this.hasOwnProperty('requestDataFunc') ? this['requestDataFunc'] : null;
    this.activeUrlParams = this.hasOwnProperty('activeUrlParams') ? this['activeUrlParams'] : null;
    this.scrollPositions = this.hasOwnProperty('scrollPositions') ? this['scrollPositions'] : {};
  }

  protected scrollHandle() {
    let initialHeight;
    let scrollHeight;
    let scrollTop;
    const tableContainer = document.getElementsByClassName('scrollable-container')[0];

    if (tableContainer) {
      initialHeight = tableContainer.clientHeight;
      scrollHeight = tableContainer.scrollHeight;
      scrollTop = tableContainer.scrollTop;

      this.keepOldList = true;
      this.listEnded = this.totalCount === this.elementCount;

    } else {

      initialHeight = this.initialBodyHeight;
      scrollHeight = document.body.scrollHeight;
      this.keepOldList = true;

      if (this.isOnReportsPage) {
        this.scrollPositions[this.activeTab] = document.body.scrollTop;
        scrollTop = this.scrollPositions[this.activeTab];
      } else {
        scrollTop = document.body.scrollTop;
      }

      this.listEnded = this.totalCount === this.elementCount;
    }

    if (scrollHeight - scrollTop < initialHeight + 100
      && this.elementCount < this.totalCount
      && !this.initialRequestInProgress && !this.requestInProgress) {
      if (this.isOnReportsPage) {
        this.page += 1;
        this.requestDataFunc(this.activeTab);
      } else if (this.infiniteScrollTabIds.includes(this.activeTab)) {
        let topTab;
        switch (this.activeTab) {
          case 'study_classes_at_risk':
            if (this.tabTopActive === 'my_classes') {
              topTab = this.tabTopActive;
            } else {
              topTab = 'classes';
            }
            break;
          case 'students_at_risk':
            topTab = 'students';
            break;
          case 'academic_programs_at_risk':
            topTab = 'profiles';
            break;
          case 'inactive_teachers':
            topTab = 'teachers';
            break;
          case 'inactive_parents':
            topTab = 'class_mastery';
            break;
        }
        this.page += 1;
        this.requestDataFunc(topTab, this.activeTab);
      } else {
        this.requestedPageCount += 1;
        this.requestDataFunc({...this.activeUrlParams, page: this.requestedPageCount});
      }
    }
  }
}
