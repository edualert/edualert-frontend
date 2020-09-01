import {NgModule} from '@angular/core';
import {DatepickerComponent} from './datepicker.component';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [DatepickerComponent],
  exports: [DatepickerComponent],
  imports: [FormsModule, CommonModule]
})
export class DatepickerModule {
}
