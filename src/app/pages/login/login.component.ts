import {Component, OnInit, ViewChild, ElementRef, Injector} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AccountService} from '../../services/account.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {AuthService} from '../../services/auth.service';
import {SchoolNamesService} from '../../services/school-names.service';
import {getLoginPageRoute} from '../../shared/utils';
import {IdName} from '../../models/id-name';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  readonly schoolNamesService: SchoolNamesService;
  
  schools: IdName[];
  selectedSchool: IdName;
  schoolId: string | number;
  isFaculty: boolean;
  page: 'login-admin' | 'login-faculty' | 'forgot-password' | 'reset-password' | any;
  username: string = '';
  password: string = '';
  repeatPassword: string = '';
  errorLogin: string | null = '';
  forgotPasswordError: string = '';

  @ViewChild('submitButton') submitButton: ElementRef;

  constructor(injector: Injector, private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService,
              private authService: AuthService) {
    this.page = this.router.url.replace('/', '');
    this.schoolNamesService = injector.get(SchoolNamesService);

    this.initialiseLoginPage()
  }

  initialiseLoginPage() {
    switch (this.page) {
      case "login-admin":
        LocalStorageService.setIsFaculty(false);
        this.page = 'login';
        this.isFaculty = false;
        break;
      case "login-faculty":
        LocalStorageService.setIsFaculty(true);
        this.page = 'login';
        this.isFaculty = true;
        this.schoolId = LocalStorageService.getSchoolId();
        this.schoolNamesService.getCustomData(false, true).subscribe((response) => {
          this.schools = response;

          if (this.schoolId) {
            this.selectedSchool = this.schools.find(element => element.id.toString() === this.schoolId);
          }
        });
        break;
    }
  }

  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.page = val.url.replace('/', '');
        this.repeatPassword = '';
        this.initialiseLoginPage();
      }
    });
  }

  handleSubmit(event): void {
    this.errorLogin = '';
    this.submitButton.nativeElement.blur();
    switch (this.page) {
      case 'login':
        this.login(event);
        break;
      case 'forgot-password':
        this.resetPassword(event);
        break;
      default:
        this.saveNewPassword(event);
    }
  }

  login(event): void {
    event.preventDefault();
    let sent_username = this.username;

    if (this.isFaculty) {
      if (this.schoolId) {
        sent_username = `${this.schoolId}_${this.username}`;
      }
      else {
        this.router.navigateByUrl(getLoginPageRoute());
      }
    }
    this.authService.requestToken(sent_username, this.password).subscribe(() => {
      this.accountService.setAccount();
      this.router.navigateByUrl('');
    }, (error) => {
      if (error.error.error === 'invalid_grant' || error.error.error === 'invalid_request') {
        this.errorLogin = 'Nume utilizator sau parolă incorecte!';
      } else {{
        this.errorLogin = error.error.errorMessage;
      }}
    });
  }

  resetPassword(event): void {
    event.preventDefault();
    // TODO do the request and handle the error from the backend when implemented
    this.forgotPasswordError = 'Acest nume de utilizator nu este asociat unui cont de utilizator.';
  }

  saveNewPassword(event): void {
    event.preventDefault();
    this.router.navigateByUrl(getLoginPageRoute());

  }

  switchToForgotPassword(event): void {
    this.errorLogin = '';
    event.preventDefault();
    this.router.navigateByUrl('forgot-password');
  }

  switchToLogin(event): void {
    this.username = '';
    this.password = '';
    this.forgotPasswordError = '';
    event.preventDefault();
    this.router.navigateByUrl(getLoginPageRoute());
  }

  handleSchoolChange(entry: { element, index }): void {
    this.selectedSchool = entry.element;
  }

  goToLoginStep(step_number: number): void {
    this.username = '';
    this.password = '';
    this.errorLogin = '';
    switch (step_number) {
      case 1:
        this.schoolId = null;
        LocalStorageService.removeSchoolId();
        break;
      case 2:
        this.schoolId = this.selectedSchool.id;
        LocalStorageService.setSchoolId(this.schoolId.toString());
        break;
    }
  }

  hideErrorToast() {
    this.forgotPasswordError = '';
  }
}
