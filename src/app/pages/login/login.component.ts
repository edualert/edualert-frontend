import { Component, OnInit, ViewChild, ElementRef, Injector } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { AuthService } from '../../services/auth.service';
import { SchoolNamesService } from '../../services/school-names.service';
import { getLoginPageRoute } from '../../shared/utils';
import { IdName } from '../../models/id-name';

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
  errorLogin: string = '';
  errorRepeatPassword: string = '';
  forgotPasswordError: string = '';
  forgotPasswordSuccess: string = '';
  resetPasswordError: string = '';
  accessKeyResetPassword: string = '';

  @ViewChild('submitButton') submitButton: ElementRef;

  constructor(injector: Injector, private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService,
              private authService: AuthService) {
    const page = this.router.url.replace('/', '').split('/');
    this.page = page[0];
    this.accessKeyResetPassword = page.length >= 2 ? page[1] : '';
    this.schoolNamesService = injector.get(SchoolNamesService);

    this.initialiseLoginPage();
  }

  initialiseLoginPage() {
    switch (this.page) {
      case 'login-admin':
        LocalStorageService.setIsFaculty(false);
        this.page = 'login';
        this.isFaculty = false;
        break;
      case 'login-faculty':
        LocalStorageService.setIsFaculty(true);
        this.page = 'login';
        this.isFaculty = true;
        this.schoolId = LocalStorageService.getSchoolId();
        this.schoolNamesService.getCustomData(false, true).subscribe((response) => {
          this.schools = response;
          if (this.schools.length > 0) {
            this.handleSchoolChange({element: this.schools[0], index: 0});
          }

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
    this.hideErrorToast();
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
    this.username = this.username.trim();
    let sent_username = this.username;

    if (this.isFaculty) {
      if (this.schoolId) {
        sent_username = `${this.schoolId}_${this.username}`;
      } else {
        this.router.navigateByUrl(getLoginPageRoute());
      }
    }
    this.authService.requestToken(sent_username, this.password).subscribe(() => {
      this.accountService.setAccount();
      this.router.navigateByUrl('');
    }, (error) => {
      if (error.error.error === 'invalid_grant' || error.error.error === 'invalid_request') {
        this.errorLogin = 'Credențiale incorecte sau cont dezactivat. Contactați un administrator.';
      } else {
        this.errorLogin = error.error.errorMessage;
      }
    });
  }

  resetPassword(event): void {
    event.preventDefault();
    this.username = this.username.trim();
    let sent_username = this.username;

    if (!this.username) {
      this.forgotPasswordError = 'Câmpul este obligatoriu.';
      this.forgotPasswordSuccess = null;
      return;
    }

    if (this.isFaculty) {
      if (this.schoolId) {
        sent_username = `${this.schoolId}_${this.username}`;
      } else {
        this.router.navigateByUrl(getLoginPageRoute());
      }
    }
    this.authService.forgotPassword(sent_username).subscribe((response: any) => {
        this.forgotPasswordSuccess = 'Un email pentru resetarea parolei a fost trimis!';
        this.forgotPasswordError = null;
      },
      (error) => {
        this.forgotPasswordError = error.error.message;
        this.forgotPasswordSuccess = null;
      });
  }

  saveNewPassword(event): void {
    event.preventDefault();
    if (!this.isResetPasswordFormValid()) {
      return;
    }
    this.authService.resetPassword(this.accessKeyResetPassword, this.password).subscribe((response) => {
      this.router.navigateByUrl(getLoginPageRoute());
    }, (error1) => {
      this.resetPasswordError = error1.error.message;
    });
  }

  isResetPasswordFormValid(): boolean {
    if (!this.password && !this.repeatPassword) {
      this.resetPasswordError = 'Aceste câmpuri sunt obligatori.';
      this.errorLogin = ' ';
      this.errorRepeatPassword = ' ';
      return false;
    } else {
      if (!this.password) {
        this.resetPasswordError = 'Câmpul (Parolă) este obligatoriu.';
        this.errorLogin = ' ';
        return false;
      }
      if (!this.repeatPassword) {
        this.resetPasswordError = 'Câmpul (Repetare parolă nouă) este obligatoriu.';
        this.errorRepeatPassword = ' ';
        return false;
      }
    }
    if ((this.repeatPassword.length < 6 || this.repeatPassword.length > 128) && (this.password.length < 6 || this.password.length > 128)) {
      this.resetPasswordError = 'Format incorect. Scrieți minim 6, maxim 128 caractere, fără spații.';
      this.errorLogin = ' ';
      this.errorRepeatPassword = ' ';
      return false;
    } else {
      if (this.password.length < 6 || this.password.length > 128) {
        this.resetPasswordError = 'Format incorect pentru câmpul (Parolă). Scrieți minim 6, maxim 128 caractere, fără spații.';
        this.errorLogin = ' ';
        return false;
      }
      if (this.repeatPassword.length < 6 || this.repeatPassword.length > 128) {
        this.resetPasswordError = 'Format incorect pentru câmpul (Repetare parolă nouă). Scrieți minim 6, maxim 128 caractere, fără spații.';
        this.errorRepeatPassword = ' ';
        return false;
      }
    }
    if (this.password !== this.repeatPassword) {
      this.resetPasswordError = 'Cele două parole (Parolă nouă și Repetare parolă nouă) trebuie sa fie identice.';
      this.errorLogin = ' ';
      this.errorRepeatPassword = ' ';
      return false;
    }
    return true;
  }

  switchToForgotPassword(event): void {
    this.errorLogin = '';
    event.preventDefault();
    this.router.navigateByUrl('forgot-password');
  }

  switchToLogin(event): void {
    this.username = '';
    this.password = '';
    this.errorLogin = '';
    this.forgotPasswordSuccess = null;
    this.forgotPasswordError = null;
    this.resetPasswordError = null;
    this.errorRepeatPassword = null;
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
    this.forgotPasswordSuccess = '';
    this.resetPasswordError = '';
    this.errorLogin = '';
    this.errorRepeatPassword = '';
  }

  showHidePassword(element) {
    element.type = element.type === 'password' ? 'text' : 'password';
  }

}
