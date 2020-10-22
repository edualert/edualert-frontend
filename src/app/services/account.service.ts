import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UserDetails} from '../models/user-details';
import {IdFullname} from '../models/id-fullname';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  account: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(new UserDetails());
  selectedChild: BehaviorSubject<IdFullname> = new BehaviorSubject<IdFullname>(null);

  constructor(private http: HttpClient) {
    this.setAccount();
  }

  public clearAccount(): void {
    this.account.next(new UserDetails());
  }

  public setAccount(): void {
    this.http.get('my-account/').subscribe((response: UserDetails) => {
      this.account.next(new UserDetails(response));
      if (response.user_role === 'PARENT' && response.children?.length) {
        this.selectChild(response.children[0].id as number);
      }
    });
  }

  public selectChild(child_id: number): void {
    const children = this.account.getValue().children;
    const childrenIndex = children.findIndex(child => child.id === child_id);
    this.selectedChild.next(children[childrenIndex]);
  }
}
