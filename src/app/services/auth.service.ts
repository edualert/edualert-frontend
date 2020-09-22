import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LocalStorageService} from './local-storage.service';

export class HttpAuthResponse {
  scope: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private readonly authPath = 'oauth2/token/';
  private readonly forgotPasswordPath = 'forgot-password/';
  private readonly setPasswordPath = 'set-password/';
  private readonly client_secret = '8EkFbvzeD0xSKszFh4n0bGGGuYzoQy979r4KnNlj0Avp4nQPrnMwSsEe5WVEx9EY4BTiIzIVb9XKYFpvI2tdzxB6ocY75ekXdT6nSuHZqLPU512fnqaUVgtXAII6rksn';
  private readonly client_id = '20pXYRpXeicuPTU93Oc26rEMV1hcFCbyMXI7oct4';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
    })
  };

  constructor(private httpClient: HttpClient) {
  }

  requestToken(username: string, password: string): Observable<HttpAuthResponse> {
    const body = new URLSearchParams();
    body.set('client_id', this.client_id);
    body.set('client_secret', this.client_secret);
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);
    return this.doRequest(body);
  }

  forgotPassword(username: string): Observable<HttpAuthResponse> {
    const body = new URLSearchParams();
    body.set('username', username);
    return this.httpClient.post<HttpAuthResponse>(this.forgotPasswordPath, body.toString(), this.httpOptions)
      .pipe(map((response: HttpAuthResponse) => {
        return response;
      }));
  }

  resetPassword(accessKey: string, new_password: string) : Observable<HttpAuthResponse> {
    const body = new URLSearchParams();
    body.set('client_id', this.client_id);
    body.set('client_secret', this.client_secret);
    body.set('grant_type', 'password');
    body.set('new_password', new_password);
    return this.httpClient.post<HttpAuthResponse>(`${this.setPasswordPath}${accessKey}/`, body.toString(), this.httpOptions)
      .pipe(map((response: HttpAuthResponse) => {
        return response;
      }));
  }

  refreshToken(): Observable<HttpAuthResponse> {
    const refresh_token = LocalStorageService.getRefreshToken();
    if (refresh_token) {
      const body = new URLSearchParams();
      body.set('client_id', this.client_id);
      body.set('client_secret', this.client_secret);
      body.set('grant_type', 'refresh_token');
      body.set('refresh_token', refresh_token);
      return this.doRequest(body);
    } else {
      return EMPTY;
    }
  }

  private doRequest(requestBody: URLSearchParams): Observable<HttpAuthResponse> {
    return this.httpClient.post<HttpAuthResponse>(this.authPath, requestBody.toString(), this.httpOptions)
      .pipe(map((response: HttpAuthResponse) => {
        LocalStorageService.setAccessToken(response.access_token);
        LocalStorageService.setRefreshToken(response.refresh_token);
        return response;
      }));
  }

  logout(): void {
    LocalStorageService.removeAccessToken();
    LocalStorageService.removeRefreshToken();
  }
}
