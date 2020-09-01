import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {HeaderModule} from '../../header/header.module';
import {MessagesComponent} from './messages.component';
import {SharedModule} from '../../shared/shared.module';
import {FilterModule} from '../../filter/filter.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {FilterSearchModule} from '../../filter-search/filter-search.module';
import { MessagesPrincipalTeacherComponent } from './messages-principal-teacher/messages-principal-teacher.component';
import { MessagesStudentParentComponent } from './messages-student-parent/messages-student-parent.component';
import { MessageDetailsComponent } from './message-details/message-details.component';
import {MessagesCreateComponent} from './messages-create/messages-create.component';
import {ViewUserModalModule} from "../manage-users/view-user-modal/view-user-modal.module";


@NgModule({
  declarations: [
    MessagesComponent,
    MessagesPrincipalTeacherComponent,
    MessagesStudentParentComponent,
    MessageDetailsComponent,
    MessagesCreateComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    FilterModule,
    FilterSearchModule,
    ViewUserModalModule,
    DropdownModule,
    SharedModule,
    ViewUserModalModule
  ],
})
export class MessagesModule { }
