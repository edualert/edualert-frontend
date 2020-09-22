import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AuthService, HttpAuthResponse} from './auth.service';
import {catchError} from 'rxjs/operators';
import {flatMap} from 'rxjs/internal/operators';
import {LocalStorageService} from './local-storage.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService,
              private router: Router) {
  }

  private static setAuthTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({setHeaders: {'Authorization': 'Bearer ' + token}});
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = LocalStorageService.getAccessToken();
    if (token) {
      req = AuthInterceptorService.setAuthTokenHeader(req, token);
    }

    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401) {
          return this.handle401(next, req);
        }
        return throwError(err);
      }));
  }

  handle401(next: HttpHandler, req: HttpRequest<any>): Observable<any> {
    return this.authService.refreshToken().pipe(
      flatMap((response: HttpAuthResponse) => {
        const newReq = AuthInterceptorService.setAuthTokenHeader(req, response.access_token);
        return next.handle(newReq);
      }),
      catchError( err => {
        if ( err.status === 400 ) {
          this.router.navigateByUrl('');
          LocalStorageService.removeAccessToken();
          LocalStorageService.removeRefreshToken();
        }
        return throwError(err);
      })
    );
  }

}
