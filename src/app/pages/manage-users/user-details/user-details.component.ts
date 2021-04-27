import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { get } from 'lodash';
import { UserDetails } from '../../../models/user-details';
import { formatPhoneNumber } from '../../../shared/utils';
import { userRoles } from '../../../models/user-roles';
import { ViewUserModalComponent } from '../view-user-modal/view-user-modal.component';
import { ManageUsersComponent } from '../manage-users.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss', '../../../shared/label-styles.scss']
})
export class UserDetailsComponent implements OnInit {
  @ViewChild('userDetailsModal', {static: false}) userDetailsModal: ViewUserModalComponent;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;

  readonly userRoles = userRoles;
  userId: string;
  userDetails: UserDetails;
  availableFields: {
    studyClass?: boolean,
    labels?: boolean,
    address?: boolean,
    personalNumber?: boolean,
    birthDate?: boolean,
    taughtSubjects?: boolean,
    parentSection?: boolean,
    pedagogueSection?: boolean
  };
  formatPhoneNumber = formatPhoneNumber;
  displayErrorToast: boolean = false;
  toastErrorMessage: string;
  isUserInactive: boolean = false;

  constructor(private accountService: AccountService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  openViewUserModal(id: string | number) {
    this.userDetailsModal.open(id);
  }

  private static constructAvailableFields(userRole: string): object {
    return {
      studyClass: userRole === 'STUDENT',
      labels: ['SCHOOL_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'].includes(userRole),
      address: ['PARENT', 'STUDENT'].includes(userRole),
      personalNumber: userRole === 'STUDENT',
      birthDate: userRole === 'STUDENT',
      taughtSubjects: ['SCHOOL_PRINCIPAL', 'TEACHER'].includes(userRole),
      parentSection: userRole === 'STUDENT',
      pedagogueSection: userRole === 'STUDENT',
    };
  }

  private getUserDetails(): void {
    this.activatedRoute.params.subscribe(params => {
      this.userId = get(params, 'userId', null);
      this.httpClient.get<UserDetails>('users/' + this.userId + '/').subscribe(response => {
        this.userDetails = new UserDetails(response);
        this.availableFields = UserDetailsComponent.constructAvailableFields(this.userDetails?.user_role);
        if (response.last_online === null && response.is_active) {
          this.isUserInactive = true;
        }
      }, error => {
        if (error.status === 404) {
          this.router.navigateByUrl('').then();
        }
      });
    });
  }

  getLabelsString(): string {
    let result = '';
    this.userDetails?.labels?.map(el => result += el.text + ', ');
    return result.substring(0, result.length - 2);
  }

  hideErrorToast() {
    this.toastErrorMessage = '';
    this.displayErrorToast = false;
  }

  openDeActivateUserModal(user: UserDetails, event?: any) {
    event.stopPropagation();
    const modalData = {
      title: `Doriți să ${user.is_active ? 'dezactivați' : 'activați'} contul utilizatorului ${user.full_name}?`,
      description: `Acest utilizator ${user.is_active ? 'nu' : ''} se va ${user.is_active ? 'mai' : ''} putea autentifica ${user.is_active ? '' : 'din nou'} în contul EduAlert.`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        if (user.is_active) {
          this.httpClient.post('users/' + this.userDetails.id + '/deactivate/', {}).subscribe((response => {
            this.userDetails = new UserDetails(response);
            this.availableFields = UserDetailsComponent.constructAvailableFields(this.userDetails?.user_role);
          }), (error) => {
            if (error.error.new_school_principal) {
              this.displayErrorToast = true;
              this.toastErrorMessage = ManageUsersComponent.principalChangeErrorMsg;
            } else if (error.error.new_teachers) {
              this.displayErrorToast = true;
              this.toastErrorMessage = ManageUsersComponent.teacherChangeErrorMsg;
            }
          });
        } else {
          this.httpClient.post('users/' + this.userDetails.id + '/activate/', {}).subscribe((response => {
              this.userDetails = new UserDetails(response);
              this.availableFields = UserDetailsComponent.constructAvailableFields(this.userDetails?.user_role);
            })
          );
        }
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  openDeleteUserModal(user: UserDetails, event?: any) {
    event.stopPropagation();
    const modalData = {
      title: `Doriți să ștergeți contul utilizatorului ${user.full_name}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.httpClient.delete(`users/${this.userDetails.id}/`).subscribe((response) => {
          if (response === null) {
            this.router.navigate(['manage-users']);
          }
        }, (error) => {
          if (error.status === 400) {
            this.displayErrorToast = true;
            switch (this.userDetails.user_role) {
              case 'SCHOOL_PRINCIPAL':
                this.toastErrorMessage = ManageUsersComponent.principalChangeErrorMsg;
                break;
              case 'TEACHER':
                this.toastErrorMessage = ManageUsersComponent.teacherChangeErrorMsg;
                break;
              case 'STUDENT':
                this.toastErrorMessage = ManageUsersComponent.studentChangeErrorMsg;
                break;
              default:
                this.toastErrorMessage = ManageUsersComponent.defaultChangeErrorMsg;
            }
          }
        });
      }
    };
    this.appConfirmationModal.open(modalData);
  }
}
