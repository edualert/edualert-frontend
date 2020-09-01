import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {timeout} from 'rxjs/operators';
import {Observable} from 'rxjs';


export class TimeoutInterceptorService implements HttpInterceptor {
  private readonly defaultTimeout = 10000;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutValue = Number(req.headers.get('timeout') || this.defaultTimeout);
    return next.handle(req).pipe(timeout(timeoutValue));
  }

}
