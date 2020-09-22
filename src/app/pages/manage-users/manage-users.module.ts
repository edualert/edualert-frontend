import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ManageUsersComponent} from './manage-users.component';
import {CoreModule} from '../../core/core.module';
import {AddUserModalModule} from './add-user-modal/add-user-modal.module';
import {HeaderModule} from '../../header/header.module';
import {UserDetailsComponent} from './user-details/user-details.component';
import {SharedModule} from '../../shared/shared.module';
import {FilterModule} from '../../filter/filter.module';
import {FilterSearchModule} from '../../filter-search/filter-search.module';
import {ModalModule} from '../../shared/modal/modal.module';
import {AddNewUserModalModule} from './add-new-user-modal/add-new-user-modal.module';
import {ConfirmationModalModule} from '../../shared/confirmation-modal/confirmation-modal.module';
import {ViewUserModalModule} from './view-user-modal/view-user-modal.module';
import {AddUserComponent} from './add-edit-user-details/add-user/add-user.component';
import {EditUserComponent} from './add-edit-user-details/edit-user/edit-user.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {AddEditUserDetailsComponent} from './add-edit-user-details/add-edit-user-details.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AddUsersBulkModule} from './add-users-bulk/add-users-bulk.module';
import {ReplaceTeacherModalComponent} from './replace-teacher-modal/replace-teacher-modal.component';


@NgModule({
  declarations: [
    ManageUsersComponent,
    UserDetailsComponent,
    AddUserComponent,
    EditUserComponent,
    AddEditUserDetailsComponent,
    ReplaceTeacherModalComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    AddUserModalModule,
    ViewUserModalModule,
    HeaderModule,
    SharedModule,
    FilterModule,
    FilterSearchModule,
    DropdownModule,
    ModalModule,
    AddNewUserModalModule,
    ConfirmationModalModule,
    AddUsersBulkModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ManageUsersModule {
}
