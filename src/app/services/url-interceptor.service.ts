import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export class UrlInterceptorService implements HttpInterceptor {
  private static readonly baseUrl = environment.apiUrl;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuthenticationRequest = req.url.includes('oauth2/token');
    const reqClone = req.clone({
      url: `${UrlInterceptorService.baseUrl}/${isAuthenticationRequest ? '' : 'api/v1/'}${req.url}`
    });
    return next.handle(reqClone);
  }
}
