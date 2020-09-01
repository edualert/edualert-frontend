import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {LocalStorageService} from './local-storage.service';
import {getLoginPageRoute} from '../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router) {
  }

  private static pathNeedsToken(path: string = '') {
    return (!path.includes('login-admin') && !path.includes('login-faculty') && !path.includes('forgot-password') && !path.includes('reset-password'));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = LocalStorageService.getAccessToken();
    if (AuthGuardService.pathNeedsToken(route.url[0]?.path)) {
      if (!token) {
        this.router.navigate([getLoginPageRoute()]);
        return false;
      }
      return true;
    } else {
      if (token) {
        this.router.navigateByUrl('');
        return false;
      }
      return true;
    }
  }
}
