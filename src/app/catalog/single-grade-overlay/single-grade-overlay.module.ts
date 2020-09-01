import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DatepickerModule} from '../../shared/datepicker/datepicker.module';
import {SingleGradeOverlayComponent} from './single-grade-overlay.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';

@NgModule({
  declarations: [SingleGradeOverlayComponent],
  imports: [
    CommonModule,
    DatepickerModule,
    DropdownModule
  ],
  exports: [SingleGradeOverlayComponent]
})

export class SingleGradeOverlayModule {
}
