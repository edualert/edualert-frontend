import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DatepickerModule} from '../../shared/datepicker/datepicker.module';
import {SingleAbsenceOverlayComponent} from './single-absence-overlay.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';

@NgModule({
  declarations: [SingleAbsenceOverlayComponent],
  imports: [
    CommonModule,
    DatepickerModule,
    DropdownModule
  ],
  exports: [SingleAbsenceOverlayComponent]
})

export class SingleAbsenceOverlayModule {
}
