import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable, pipe, of} from 'rxjs';
import {switchMap, delay} from 'rxjs/operators';
import {AccountService} from './account.service';
import {menuLinks} from '../shared/constants';
import {UserDetails} from '../models/user-details';

@Injectable({
  providedIn: 'root'
})
export class UserRoleEnforcementService implements CanActivate {
  lastRoute: string;
  lastRouteRepeatCount: number = 0;

  constructor(private router: Router, private accountService: AccountService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.accountService.account.pipe(switchMap((user: UserDetails, index: number) => {
      const currentRoute = route.url?.join('/');
      if (this.lastRoute == currentRoute) {
        this.lastRouteRepeatCount++;
      } else {
        this.lastRoute = currentRoute;
        this.lastRouteRepeatCount = 0;
      }

      if (!user.user_role && this.lastRouteRepeatCount < 10) {
        return of<UrlTree>(this.router.parseUrl(currentRoute)).pipe(delay(1001));  // cover timeout of backend request
      } else if (!route.url[0]?.path) {
        return of<boolean>(true);
      } else if (menuLinks[user.user_role]?.findIndex(element => element.path === route.url[0].path) > 0) {
        return of<boolean>(true);
      } else {
        return of<boolean>(false);
      }
    }));
  }
}
