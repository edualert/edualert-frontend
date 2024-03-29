import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input/input.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LabelComponent } from './label/label.component';
import { DateRangeInputComponent } from './date-range-input/date-range-input.component';
import { DatepickerModule } from './datepicker/datepicker.module';
import { TabsComponent } from './tabs/tabs.component';
import { CalendarComponent } from './calendar/calendar.component';
import { InputNewComponent } from './input-new/input-new.component';
import { ReportsTableModule } from './reports-table/reports-table.module';
import { ToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  declarations: [
    TabsComponent,
    LabelComponent,
    InputComponent,
    DateRangeInputComponent,
    CalendarComponent,
    InputNewComponent,
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DatepickerModule,
  ],
  exports: [
    TabsComponent,
    InputComponent,
    LabelComponent,
    CommonModule,
    RouterModule,
    DateRangeInputComponent,
    DatepickerModule,
    CalendarComponent,
    InputNewComponent,
    ReportsTableModule,
    ToolbarComponent
  ],
})
export class SharedModule {
}
