import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExpandedCellComponent} from './expanded-cell.component';
import {SingleGradeOverlayModule} from '../single-grade-overlay/single-grade-overlay.module';
import {SingleAbsenceOverlayModule} from '../single-absence-overlay/single-absence-overlay.module';
import {ConfirmationModalModule} from '../../shared/confirmation-modal/confirmation-modal.module';

@NgModule({
  declarations: [ExpandedCellComponent],
  imports: [
    CommonModule,
    SingleGradeOverlayModule,
    SingleAbsenceOverlayModule,
    ConfirmationModalModule
  ],
  exports: [ExpandedCellComponent],
})
export class ExpandedCellModule {
}
