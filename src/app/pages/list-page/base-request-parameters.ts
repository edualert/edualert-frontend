import {HttpParams} from '@angular/common/http';


export default class BaseRequestParameters {
  public getHttpParams(): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(this).forEach((attribute) => {
      if (this[attribute] || typeof this[attribute] === 'number') {
        httpParams = httpParams.set(attribute, this[attribute]);
      }
    });
    return httpParams;
  }
}
