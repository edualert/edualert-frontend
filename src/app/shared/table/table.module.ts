import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from './table.component';
import {CoreModule} from '../../core/core.module';
import {TableCellComponent} from '../../catalog/table-cell/table-cell.component';
import {RouterModule} from '@angular/router';
import {ViewUserModalModule} from '../../pages/manage-users/view-user-modal/view-user-modal.module';

@NgModule({
  declarations: [
    TableComponent,
    TableCellComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule,
    ViewUserModalModule
  ],
  exports: [
    TableComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TableModule {
}
