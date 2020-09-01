import {Component} from '@angular/core';
import {AccountService} from './services/account.service';
import {LocalStorageService} from './services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private accountService: AccountService, private localStorageService: LocalStorageService) {
  }
}
