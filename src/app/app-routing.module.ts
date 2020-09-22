import {NgModule} from '@angular/core';
import {Routes, RouterModule, UrlSegment, UrlMatchResult} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {DevtoolsComponent} from './pages/devtools/devtools.component';
import {ManageClassProfilesComponent} from './pages/manage-class-profiles/manage-class-profiles.component';
import {MyAccountComponent} from './pages/my-account/my-account.component';
import {StudentOwnSituationComponent} from './pages/school-situation/student-own-situation.component';
import {SchoolDetailComponent} from './pages/manage-schools/school-detail/school-detail.component';
import {EditSchoolDetailsComponent} from './pages/manage-schools/add-edit-schools/edit-school-details/edit-school-details.component';
import {AddSchoolDetailsComponent} from './pages/manage-schools/add-edit-schools/add-school-details/add-school-details.component';
import {EditStudyYearComponent} from './pages/manage-school-calendar/edit-study-year/edit-study-year.component';
import {ViewStudyYearComponent} from './pages/manage-school-calendar/view-study-year/view-study-year.component';
import {AuthGuardService} from './services/auth-guard.service';
import {UserRoleEnforcementService} from './services/user-role-enforcement.service';
import {CanLeaveAddEditSchoolGuardService} from './services/can-leave-guard.service';
import {CanLeaveGuardService} from './services/can-leave-guard.service';
import {AddUserComponent} from "./pages/manage-users/add-edit-user-details/add-user/add-user.component";
import {EditUserComponent} from "./pages/manage-users/add-edit-user-details/edit-user/edit-user.component";
import {ClassProfileDetailComponent} from './pages/manage-class-profiles/class-profile-detail/class-profile-detail.component';
import {UserDetailsComponent} from './pages/manage-users/user-details/user-details.component';
import {ClassProfileAddEditComponent} from './pages/manage-class-profiles/class-profile-add-edit/class-profile-add-edit.component';
import {EditMyAccountComponent} from './pages/my-account/edit-my-account/edit-my-account.component';
import {ClassDetailComponent} from './pages/manage-classes/class-detail/class-detail.component';
import {HomeComponent} from './pages/home/home.component';
import {ManageUsersComponent} from './pages/manage-users/manage-users.component';
import {MessagesComponent} from './pages/messages/messages.component';
import {ReportsComponent} from './pages/reports/reports.component';
import {ManageClassesComponent} from './pages/manage-classes/manage-classes.component';
import {ManageSchoolsComponent} from './pages/manage-schools/manage-schools.component';
import {MyClassesComponent} from './pages/my-classes/my-classes.component';
import {StudentsSituationComponent} from './pages/students-situation/students-situation.component';
import {MessagesCreateComponent} from './pages/messages/messages-create/messages-create.component';
import {MessageDetailsComponent} from "./pages/messages/message-details/message-details.component";
import {ClassListDetailComponent} from './pages/my-classes/class-list-detail/class-list-detail.component';
import {AddEditStudyClassComponent} from './pages/manage-classes/add-edit-study-class/add-edit-study-class.component';
import {CatalogComponent} from './catalog/catalog.component';
import {StudentCatalogComponent} from './pages/student-catalog/student-catalog.component';

export function loginMatcher(segments: UrlSegment[]): UrlMatchResult {
  // match login, forgot password and reset password without consuming the segments
  const paths = ['login-admin', 'login-faculty', 'forgot-password', 'reset-password'];
  const match = segments.length === 1 && paths.includes(segments[0].path);
  return match ? {consumed: []} : null;
}

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'home', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuardService]},
  {
    matcher: (url) => {
      const path = url[0]?.path;
      if ((path === 'login-admin' || path === 'login-faculty' || path === 'forgot-password' || path === 'reset-password') && (url.length === 1 || (path === 'reset-password' && url.length === 2))) {
        return {
          consumed: url
        };
      }
    },
    component: LoginComponent,
    canActivate: [AuthGuardService]
  },
  {path: 'devtools', pathMatch: 'full', component: DevtoolsComponent, canActivate: [AuthGuardService]},

  {path: 'manage-class-profiles', pathMatch: 'full', component: ManageClassProfilesComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-class-profiles/:id/view', pathMatch: 'full', component: ClassProfileDetailComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-class-profiles/:id/edit', pathMatch: 'full', component: ClassProfileAddEditComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},
  {path: 'manage-class-profiles/add', pathMatch: 'full', component: ClassProfileAddEditComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},

  {path: 'manage-classes',  pathMatch: 'full', component: ManageClassesComponent, canActivate: [AuthGuardService]},
  {path: 'manage-classes/:id/view', pathMatch: 'full', component: ClassDetailComponent, canActivate: [AuthGuardService]},
  {path: 'manage-classes/:id/edit', pathMatch: 'full', component: AddEditStudyClassComponent, canActivate: [AuthGuardService], canDeactivate: [CanLeaveGuardService]},
  {path: 'manage-classes/add',  pathMatch: 'full', component: AddEditStudyClassComponent, canActivate: [AuthGuardService], canDeactivate: [CanLeaveGuardService]},

  {path: 'my-classes', pathMatch: 'full', component: MyClassesComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'my-classes/:id/class-detail', pathMatch: 'full', component: ClassListDetailComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'my-classes/:id/catalog', pathMatch: 'full', component: CatalogComponent},
  {path: 'my-classes/:classId/students/:studentId/catalog', pathMatch: 'full', component: StudentCatalogComponent},

  {path: 'manage-schools', pathMatch: 'full', component: ManageSchoolsComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-schools/:id/view', pathMatch: 'full', component: SchoolDetailComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-schools/:id/edit', pathMatch: 'full', component: EditSchoolDetailsComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveAddEditSchoolGuardService]},
  {path: 'manage-schools/add', pathMatch: 'full', component: AddSchoolDetailsComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveAddEditSchoolGuardService]},

  {path: 'manage-users', pathMatch: 'full', component: ManageUsersComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-users/:userId/view', pathMatch: 'full', component: UserDetailsComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-users/:userId/edit', pathMatch: 'full', component: EditUserComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},
  {path: 'manage-users/add', pathMatch: 'full', component: AddUserComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},

  {path: 'messages', pathMatch: 'full', component: MessagesComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'messages/create', pathMatch: 'full', component: MessagesCreateComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},
  {path: 'messages/:messageId/view', pathMatch: 'full', component: MessageDetailsComponent, canActivate: [AuthGuardService]},

  {path: 'my-account', pathMatch: 'full', component: MyAccountComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'my-account/edit', pathMatch: 'full', component: EditMyAccountComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},

  {path: 'reports', pathMatch: 'full', component: ReportsComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},

  {path: 'school-situation', pathMatch: 'full', component: StudentOwnSituationComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},

  {path: 'students-situation', pathMatch: 'full', component: StudentsSituationComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},

  {path: 'manage-school-calendar', pathMatch: 'full', component: ViewStudyYearComponent, canActivate: [AuthGuardService, UserRoleEnforcementService]},
  {path: 'manage-school-calendar/edit', pathMatch: 'full', component: EditStudyYearComponent, canActivate: [AuthGuardService, UserRoleEnforcementService], canDeactivate: [CanLeaveGuardService]},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
