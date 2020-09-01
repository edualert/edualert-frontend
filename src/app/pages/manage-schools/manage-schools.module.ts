import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {HeaderModule} from '../../header/header.module';
import {ManageSchoolsComponent} from './manage-schools.component';
import {SharedModule} from '../../shared/shared.module';
import {FilterModule} from '../../filter/filter.module';
import {FilterSearchModule} from '../../filter-search/filter-search.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import { AddEditModule } from './add-edit-schools/add-edit-schools.module';
import {ModalModule} from '../../shared/modal/modal.module';
import {ConfirmationModalModule} from '../../shared/confirmation-modal/confirmation-modal.module';
import {SchoolDetailComponent} from './school-detail/school-detail.component';
import {ViewUserModalModule} from '../manage-users/view-user-modal/view-user-modal.module';


@NgModule({
  declarations: [
    ManageSchoolsComponent,
    SchoolDetailComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    FilterModule,
    FilterSearchModule,
    DropdownModule,
    SharedModule,
    ModalModule,
    ConfirmationModalModule,
    ViewUserModalModule
  ],
  exports: [AddEditModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManageSchoolsModule {
}
