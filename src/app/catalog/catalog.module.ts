import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CatalogComponent} from './catalog.component';
import {TableCellComponent} from './table-cell/table-cell.component';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {RouterModule} from '@angular/router';
import {ViewUserModalModule} from '../pages/manage-users/view-user-modal/view-user-modal.module';
import {ExpandedCellModule} from './expanded-cell/expanded-cell.module';
import {SharedModule} from '../shared/shared.module';
import {ModalModule} from '../shared/modal/modal.module';
import {PupilLabelsModalComponent} from './pupil-labels-modal/pupil-labels-modal.component';
import {PupilRemarksModalComponent} from "./pupil-remarks-modal/pupil-remarks-modal.component";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    CatalogComponent,
    TableCellComponent,
    PupilLabelsModalComponent,
    PupilRemarksModalComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule,
    ViewUserModalModule,
    ExpandedCellModule,
    SharedModule,
    ModalModule,
    FormsModule,
  ],
  exports: [CatalogComponent, TableCellComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CatalogModule {
}
