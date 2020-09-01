import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {HeaderModule} from '../../header/header.module';
import {ManageClassesComponent} from './manage-classes.component';
import {SharedModule} from '../../shared/shared.module';
import {FilterModule} from '../../filter/filter.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {ConfirmationModalModule} from '../../shared/confirmation-modal/confirmation-modal.module';
import {ClassDetailModule} from './class-detail/class-detail.module';
import { AddEditStudyClassComponent } from './add-edit-study-class/add-edit-study-class.component';
import {AddNewUserModalModule} from '../manage-users/add-new-user-modal/add-new-user-modal.module';


@NgModule({
  declarations: [
    ManageClassesComponent,
    AddEditStudyClassComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    FilterModule,
    DropdownModule,
    SharedModule,
    ConfirmationModalModule,
    AddNewUserModalModule
  ],
  exports: [ClassDetailModule]
})
export class ManageClassesModule {
}
