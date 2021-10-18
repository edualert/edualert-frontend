import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {HeaderModule} from '../../header/header.module';
import {MyClassesComponent} from './my-classes.component';
import {SharedModule} from '../../shared/shared.module';
import {FilterModule} from '../../filter/filter.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {ClassListDetailComponent} from './class-list-detail/class-list-detail.component';
import {AddGradesBulkModalModule} from '../../catalog/modals/add-grades-bulk-modal/add-grades-bulk-modal.module';
import {AddAbsencesBulkModalModule} from '../../catalog/modals/add-absences-bulk-modal/add-absences-bulk-modal.module';
import {CatalogModule} from '../../catalog/catalog.module';
import {SettingsModalModule} from '../../catalog/settings-modal/settings-modal.module';
import {ViewUserModalModule} from '../manage-users/view-user-modal/view-user-modal.module';


@NgModule({
  declarations: [
    MyClassesComponent,
    ClassListDetailComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    FilterModule,
    DropdownModule,
    SharedModule,
    CatalogModule,
    AddGradesBulkModalModule,
    AddAbsencesBulkModalModule,
    SettingsModalModule,
    ViewUserModalModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyClassesModule {
}
