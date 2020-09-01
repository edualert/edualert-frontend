import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { ReportsOrsComponent } from './reports-ors/reports-ors.component';
import { ReportsPrincipalComponent } from './reports-principal/reports-principal.component';
import { ReportsTeacherComponent } from './reports-teacher/reports-teacher.component';
import { ReportsStudentParentComponent } from './reports-student-parent/reports-student-parent.component';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import {HeaderModule} from "../../header/header.module";
import { MonthPickerComponent } from './month-picker/month-picker.component';
import {ViewUserModalModule} from '../manage-users/view-user-modal/view-user-modal.module';
import {NgxChartsModule} from '@swimlane/ngx-charts';

@NgModule({
  declarations: [
    ReportsComponent,
    ReportsOrsComponent,
    ReportsPrincipalComponent,
    ReportsTeacherComponent,
    ReportsStudentParentComponent,
    MonthPickerComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    HeaderModule,
    NgxChartsModule,
    ViewUserModalModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportsModule { }
